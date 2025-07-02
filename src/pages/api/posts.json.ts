import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("post");
  // @ts-expect-error
  posts.map((post) => (post.data.pubDate = post.data.pubDate.toLocaleDateString()));

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
