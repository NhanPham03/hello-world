import type { CollectionEntry } from "astro:content";
import type { FunctionalComponent } from "preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import { marked } from "marked";

type PostId = string | null;

// PostViewer component
export const PostViewer: FunctionalComponent = () => {
  // Fetched posts for display
  const [posts, setPosts] = useState<CollectionEntry<"post">[]>([]);
  const [currentId, setCurrentId] = useState<PostId>(null);

  // History for back/forward navigation
  const [history, setHistory] = useState<PostId[]>([null]); // null = home
  const [current, setCurrent] = useState<number>(0);

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/posts.json")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  // Find the post from the posts state
  const post = currentId ? posts.find((p) => p.id === currentId) : null;

  const goTo = useCallback((id: PostId) => {
    if (history[current] === id) return; // Don't add duplicate if already current post
    const newHistory = [...history.slice(0, current + 1), id];
    setHistory(newHistory);
    setCurrent(newHistory.length - 1);
    setCurrentId(id);
  }, [history, current]);

  const goBack = useCallback(() => {
    if (current > 0) {
      setCurrent(current - 1);
      setCurrentId(history[current - 1]);
    }
  }, [current, history]);

  const goForward = useCallback(() => {
    if (current < history.length - 1) {
      setCurrent(current + 1);
      setCurrentId(history[current + 1]);
    }
  }, [current, history]);

  return (
    <div className={`postviewer${loading ? " loading" : ""}`}>
      {/* Sidebar */}
      <aside className="pv-sidebar">
        <h3>Posts</h3>
        {/* Controls */}
        <div className="pv-controls">
          <button aria-label="Back" onClick={() => goBack()} disabled={current <= 0}>
            <span className="ic--baseline-arrow-back"></span>
          </button>
          <button aria-label="Forward" onClick={() => goForward()} disabled={current >= history.length - 1}>
            <span className="ic--baseline-arrow-forward"></span>
          </button>
          <button aria-label="Home" onClick={() => goTo(null)} disabled={!post}>
            <span className="ic--baseline-home"></span>
          </button>
        </div>
        {/* Posts navigation */}
        <ul className="pv-list">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                onClick={() => goTo(post.id)}
                style={{
                  textDecoration: currentId === post.id ? "underline" : "none",
                  cursor: currentId === post.id ? "default" : "pointer",
                  fontWeight: currentId === post.id ? 600 : 400,
                }}
                disabled={currentId === post.id}
              >
                {post.data.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Content */}
      <main>
        {!post ? (
          <p>Please select a post from the sidebar.</p>
        ) : (
          <article className="pv-content">
            <h1>{post.data.title}</h1>
            <p>
              <em>{post.data.description}</em>
            </p>
            <p>Published on {post.data.pubDate}</p>
            <div className="tags">
              <p>Tags: </p>
              {post.data.tags.map((tag) => (
                <p className="tag">{tag}</p>
              ))}
            </div>
            {/* MAKE ABSOLUTELY SURE TO SANITIZE ENTRIES */}
            <div dangerouslySetInnerHTML={{ __html: marked(post.body!) as string }}></div>
          </article>
        )}
      </main>
    </div>
  );
};
