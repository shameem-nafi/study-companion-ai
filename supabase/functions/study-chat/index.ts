import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user context from authorization header
    const authHeader = req.headers.get("authorization");
    let userContext = "";

    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { authorization: authHeader } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user's study data for context
          const [topicsRes, coursesRes, deptsRes] = await Promise.all([
            supabase.from("topics").select("name, completed, revision_count, last_revision_at, completed_at").limit(50),
            supabase.from("courses").select("name").limit(20),
            supabase.from("departments").select("name").limit(10)
          ]);

          const topics = topicsRes.data || [];
          const completedTopics = topics.filter(t => t.completed);
          const pendingRevisions = topics.filter(t => {
            if (!t.completed) return false;
            if (!t.last_revision_at) return true;
            const daysSince = Math.floor((Date.now() - new Date(t.last_revision_at).getTime()) / (1000 * 60 * 60 * 24));
            const revisionDays = [3, 7, 21, 60];
            const nextDay = revisionDays[Math.min(t.revision_count || 0, revisionDays.length - 1)];
            return daysSince >= nextDay;
          });

          userContext = `
User's study data:
- Total topics: ${topics.length}
- Completed topics: ${completedTopics.length}
- Pending revisions: ${pendingRevisions.length}
- Departments: ${(deptsRes.data || []).map(d => d.name).join(", ") || "None yet"}
- Courses: ${(coursesRes.data || []).map(c => c.name).join(", ") || "None yet"}
- Topics needing revision: ${pendingRevisions.map(t => t.name).slice(0, 5).join(", ") || "None"}
- Recently completed: ${completedTopics.slice(0, 5).map(t => t.name).join(", ") || "None"}

Spaced repetition schedule: Day 3, Day 7, Day 21, Day 60 after completion.
`;
        }
      } catch (e) {
        console.log("Could not fetch user context:", e);
      }
    }

    const systemPrompt = language === "bn" 
      ? `আপনি একজন সহায়ক AI স্টাডি অ্যাসিস্ট্যান্ট। আপনি শিক্ষার্থীদের তাদের পড়াশোনা পরিচালনা করতে, রিভিশন সময়সূচী তৈরি করতে এবং কার্যকর শিক্ষার কৌশল প্রদান করতে সাহায্য করেন।

${userContext}

নির্দেশনা:
- বাংলায় উত্তর দিন
- সংক্ষিপ্ত এবং কার্যকর পরামর্শ দিন
- স্পেসড রিপিটিশন পদ্ধতি অনুসরণ করুন
- প্রতিটি রিভিশনের জন্য নির্দিষ্ট সময়সূচী সুপারিশ করুন`
      : `You are a helpful AI study assistant for the Dept. ToDo app. You help students manage their studies, create revision schedules, and provide effective learning strategies.

${userContext}

Guidelines:
- Keep responses concise and actionable
- Follow spaced repetition methodology (3, 7, 21, 60 days)
- Suggest specific revision schedules when asked
- Provide study tips and motivation
- If the user has pending revisions, remind them gently
- Help prioritize topics based on revision urgency`;

    console.log("Sending request to AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Study chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
