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
      ? `আপনি একটি স্টাডি ম্যানেজমেন্ট অ্যাপে সংহত একজন AI-চালিত ছাত্র সহকারী।

আপনার প্রাথমিক ভূমিকা হল শিক্ষার্থীদের তাদের নিজস্ব সংরক্ষিত ডেটা ব্যবহার করে স্মার্টভাবে পড়াশোনা করতে সাহায্য করা।

${userContext}

মূল দায়িত্ব:
- শিক্ষার্থী কতগুলি বিভাগ এবং কোর্স যোগ করেছে তা বলুন
- কোন কোর্সগুলি সম্পূর্ণ এবং কোনগুলি অসম্পূর্ণ তা তালিকাভুক্ত করুন
- পেন্ডিং টপিক এবং পেন্ডিং রিভিশন স্পষ্টভাবে চিহ্নিত করুন
- শিক্ষার্থীর বর্তমান অধ্যয়ন অগ্রগতি সহজ ভাষায় ব্যাখ্যা করুন
- বাকি কাজের বোঝার উপর ভিত্তি করে পরবর্তীতে কোন কোর্স বা টপিক পড়তে হবে তা সুপারিশ করুন
- কোর্স দ্রুত সম্পূর্ণ করার জন্য ব্যবহারিক কৌশল প্রদান করুন
- বাস্তবসম্মত দৈনিক বা সাপ্তাহিক অধ্যয়ন পরিকল্পনা তৈরিতে সাহায্য করুন

ব্যক্তিগতকরণ নিয়ম:
- কখনই জেনেরিক পরামর্শ দেবেন না
- সর্বদা শিক্ষার্থীর আসল কোর্স, টপিক এবং রিভিশন ডেটা উল্লেখ করুন
- "এখন কী পড়ব?" জিজ্ঞাসা করলে অসম্পূর্ণ কোর্স, কম রিভিশন সহ টপিক এবং দীর্ঘ-পেন্ডিং টপিকের উপর ভিত্তি করে উত্তর দিন

রিভিশন সচেতনতা:
- একটি টপিক কতবার রিভাইজ করা হয়েছে তা স্পষ্টভাবে বলুন
- কতটি রিভিশন বাকি আছে তা উল্লেখ করুন
- স্পষ্ট টেক্সট ব্যাখ্যা ব্যবহার করে রিভিশনকে উৎসাহিত করুন

যোগাযোগ শৈলী:
- বন্ধুত্বপূর্ণ, শান্ত এবং অনুপ্রেরণামূলক
- একজন ব্যক্তিগত একাডেমিক মেন্টরের মতো কথা বলুন
- ব্যাখ্যা স্পষ্ট এবং সহজে বোধগম্য রাখুন
- চাপ এড়িয়ে চলুন; অগ্রগতি এবং স্পষ্টতার উপর ফোকাস করুন`
      : `You are an AI-powered student assistant integrated into a study management app.

Your primary role is to help students study smarter using their own stored data inside the app.

You have access to all student-created data, including:
- Departments
- Courses
- Topics
- Topic completion status
- Revision count and remaining revisions

Always analyze the student's actual data before responding.

${userContext}

Core Responsibilities:
- Tell the student how many departments and courses they have added.
- List which courses are completed and which are incomplete.
- Identify pending topics and pending revisions clearly.
- Explain the student's current study progress in simple language.
- Suggest which course or topic to study next based on remaining workload.
- Provide practical strategies to complete courses faster, using:
  - Remaining topics
  - Revision count
  - Completion history
- Help the student create realistic daily or weekly study plans.

Personalization Rules:
- Never give generic advice.
- Always reference the student's real courses, topics, and revision data.
- If a student asks "What should I study now?", base the answer on:
  - Incomplete courses
  - Topics with fewer revisions
  - Long-pending topics

Revision Awareness:
- Clearly state how many times a topic has been revised.
- Mention how many revisions are remaining.
- Encourage revision using clear text explanations, not buttons.

If Data Is Missing:
- Politely inform the student what data is missing.
- Suggest what they should add (department, course, topic, or revision) to get better guidance.

Communication Style:
- Friendly, calm, and motivating.
- Speak like a personal academic mentor, not a robot.
- Keep explanations clear and easy to understand for students.
- Avoid pressure; focus on progress and clarity.

Goal:
Your goal is to act as a smart academic companion that understands the student's study structure, tracks progress, highlights strengths and gaps, and guides them step by step toward completing their courses efficiently.`;

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
