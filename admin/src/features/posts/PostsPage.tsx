import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listPosts } from "@/features/posts/postsApi";

export function PostsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["posts"], queryFn: listPosts });

  return (
    <section className="page-stack">
      <PageHeader title="Bai viet" description="Quan ly tin tuc va noi dung thi truong." />
      <section className="panel">
        {error ? <div className="alert-error">Khong tai duoc bai viet.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tieu de</th>
                <th>Trang thai</th>
                <th>Ngay tao</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <span>{post.slug}</span>
                  </td>
                  <td><StatusBadge value={post.status} /></td>
                  <td>{new Date(post.created_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <div className="empty-state">Dang tai du lieu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chua co bai viet.</div> : null}
      </section>
    </section>
  );
}
