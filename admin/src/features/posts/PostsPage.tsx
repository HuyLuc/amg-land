import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listPosts } from "@/features/posts/postsApi";

export function PostsPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({ queryKey: ["posts"], queryFn: listPosts });

  return (
    <section className="page-stack">
      <PageHeader title="Bài viết" description="Quản lý tin tức và nội dung thị trường." />
      <section className="panel">
        {error ? <div className="alert-error">Không tải được bài viết.</div> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
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
        {isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!isLoading && !data?.items.length ? <div className="empty-state">Chưa có bài viết.</div> : null}
      </section>
    </section>
  );
}
