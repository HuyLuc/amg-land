

TRƯỜNG ĐẠI HỌC ...

**KHOA CÔNG NGHỆ THÔNG TIN**

**BÁO CÁO ĐẶC TẢ CHI TIẾT DỰ ÁN**

Đề tài:

**THIẾT KẾ WEBSITE TIN TỨC BẤT ĐỘNG SẢN**

**VÀ TÌM KIẾM KHÁCH HÀNG AMG NEWS**

**Nhóm thực hiện:**

\[Tên sinh viên 1\] – MSSV: ...

\[Tên sinh viên 2\] – MSSV: ...

**Giảng viên hướng dẫn:**

\[Họ và tên Giảng viên\]

Hà Nội, tháng 3 năm 2026

**MỤC LỤC**

**LỊCH SỬ PHIÊN BẢN TÀI LIỆU**

| Phiên bản | Ngày | Người thực hiện | Mô tả thay đổi |
| :---: | :---: | ----- | ----- |
| 1.0 | 18/03/2026 | \[Tên nhóm\] | Phiên bản khởi tạo tài liệu đặc tả |

# **CHƯƠNG 1: GIỚI THIỆU DỰ ÁN**

## **1.1. Tổng quan**

Dự án AMG News được hình thành trong quá trình thực tập tại công ty AMG Land – một doanh nghiệp hoạt động trong lĩnh vực môi giới và phân phối bất động sản. Qua quá trình khảo sát thực tế, nhóm nhận thấy công ty đang thiếu một nền tảng số chính thức để cung cấp thông tin dự án bất động sản một cách có hệ thống và chuyên nghiệp.

Hậu quả của sự thiếu hụt này là công ty thường xuyên mất đi một lượng lớn khách hàng tiềm năng – những người tìm kiếm thông tin qua internet nhưng không tìm thấy kênh chính thống, dẫn đến việc tiếp cận các nguồn thông tin thiếu chính xác hoặc chuyển sang đối thủ cạnh tranh.

Website "AMG News" được xây dựng nhằm giải quyết triệt để vấn đề trên, tạo ra một hệ sinh thái thông tin bất động sản hoàn chỉnh với sự hỗ trợ của trí tuệ nhân tạo (AI) và hệ thống quản trị nội dung (CMS) linh hoạt.

## **1.2. Lý do chọn đề tài**

* Công ty AMG Land chưa có nền tảng website chính thức để quảng bá và cung cấp thông tin dự án bất động sản.

* Lượng khách hàng tiềm năng thất thoát do không có kênh thông tin chính thống, uy tín.

* Nhu cầu thị trường về bất động sản ngày càng tăng, đặc biệt phân khúc căn hộ chung cư tại các đô thị lớn.

* Xu hướng ứng dụng AI và cá nhân hóa trải nghiệm người dùng trong lĩnh vực bất động sản đang phát triển mạnh.

* Yếu tố phong thủy đóng vai trò quan trọng trong quyết định mua bất động sản của người Việt Nam – đây là cơ hội tích hợp tư vấn AI phong thủy vào quá trình chọn căn hộ.

## **1.3. Mục tiêu dự án**

### **1.3.1. Mục tiêu tổng quát**

Xây dựng một website bất động sản hoàn chỉnh, đạt chuẩn về giao diện (UI/UX), hệ thống quản trị nội dung (CMS) và tích hợp trí tuệ nhân tạo (AI Chatbot) nhằm nâng cao trải nghiệm người dùng và hiệu quả tư vấn khách hàng cho công ty AMG Land.

### **1.3.2. Mục tiêu cụ thể**

1. Xây dựng giao diện website hiện đại, responsive, tối ưu trải nghiệm người dùng trên cả desktop và mobile.

2. Phát triển hệ thống CMS cho phép nhân viên quản lý thông tin dự án, mặt bằng, tiện ích một cách linh hoạt.

3. Triển khai bộ lọc tìm kiếm đa tiêu chí (vị trí, ngân sách, diện tích, loại hình) để hỗ trợ khách hàng nhanh chóng tìm kiếm căn hộ phù hợp.

4. Tích hợp Chatbot AI (sử dụng Gemini API) để tư vấn phong thủy và gợi ý căn hộ phù hợp theo mệnh, tuổi, hướng nhà.

5. Đảm bảo hệ thống hoạt động ổn định, bảo mật và có khả năng mở rộng trong tương lai.

## **1.4. Phạm vi dự án**

### **1.4.1. Phạm vi thực hiện**

* Xây dựng website dạng Web Application (Frontend \+ Backend \+ Database).

* Hỗ trợ 2 nhóm người dùng: Khách hàng (public) và Quản trị viên/Nhân viên (private CMS).

* Tích hợp AI Chatbot tư vấn phong thủy và gợi ý căn hộ từ dữ liệu hệ thống.

* Triển khai trên môi trường hosting hoặc máy chủ nội bộ quy mô vừa và nhỏ.

### **1.4.2. Phạm vi ngoài dự án**

* Không phát triển ứng dụng di động bản địa (iOS/Android native app).

* Không tích hợp hệ thống thanh toán trực tuyến trong giai đoạn đầu.

* Không bao gồm tính năng ký hợp đồng điện tử.

* Không xây dựng hệ thống CRM đầy đủ (chỉ quản lý thông tin dự án và căn hộ).

## **1.5. Đối tượng sử dụng hệ thống**

| Đối tượng | Mô tả | Quyền hạn |
| ----- | ----- | ----- |
| **Khách hàng** | Người có nhu cầu tìm hiểu, mua/thuê bất động sản | Xem thông tin, tìm kiếm, sử dụng chatbot tư vấn |
| **Nhân viên** | Nhân viên kinh doanh/marketing của AMG Land | Quản lý bài đăng dự án, cập nhật thông tin căn hộ |
| **Quản trị viên** | Quản trị hệ thống cấp cao | Toàn quyền: quản lý người dùng, nội dung, hệ thống |

# **CHƯƠNG 2: ĐẶC TẢ YÊU CẦU HỆ THỐNG**

## **2.1. Yêu cầu chức năng**

### **2.1.1. Phân hệ dành cho Khách hàng (Frontend)**

| Mã UC | Chức năng | Mô tả chi tiết | Ưu tiên |
| :---: | ----- | ----- | :---: |
| **UC-01** | **Trang chủ** | Hiển thị danh sách dự án đang hợp tác kèm hình ảnh, tên dự án, vị trí địa lý, giá khởi điểm và trạng thái. Có banner slider giới thiệu dự án nổi bật. | Cao |
| **UC-02** | Xem danh sách dự án | Hiển thị danh sách toàn bộ dự án với phân trang. Mỗi dự án gồm: ảnh đại diện, tên, địa chỉ, số căn hộ, giá từ, trạng thái mở bán. | Cao |
| **UC-03** | Chi tiết dự án | Xem thông tin chuyên sâu: mô tả tổng quan, vị trí bản đồ, gallery hình ảnh, danh sách tiện ích nội/ngoại khu, mặt bằng tầng điển hình, danh sách loại căn hộ đang mở bán. | Cao |
| **UC-04** | Xem chi tiết căn hộ | Hiển thị thông số kỹ thuật căn hộ: mã căn, diện tích, số phòng ngủ/WC, tầng, hướng, giá bán/thuê, trạng thái (còn trống/đã đặt/đã bán). | Cao |
| **UC-05** | Tìm kiếm & Lọc | Bộ lọc đa tiêu chí: Vị trí/Quận, Ngân sách (khoảng giá), Diện tích, Số phòng ngủ, Loại hình (căn hộ, biệt thự, shophouse, officetel). Kết quả cập nhật real-time. | Cao |
| **UC-06** | Chatbot AI Tư vấn | Giao diện chat tích hợp. Chatbot sử dụng Gemini API trả lời câu hỏi phong thủy (mệnh, tuổi, hướng nhà hợp). Sau tư vấn, tự động gợi ý các căn hộ phù hợp từ CSDL. | Cao |
| **UC-07** | Gợi ý cá nhân hóa | Hệ thống gợi ý kết hợp Rule-based (lọc cứng theo tiêu chí) và AI (tư vấn mềm). Hiển thị danh sách căn hộ gợi ý dựa trên cung mệnh, ngân sách, nhu cầu thực tế. | Trung bình |
| **UC-08** | Tin tức & Bài viết | Hiển thị các bài viết tin tức thị trường bất động sản, phân tích xu hướng. Hỗ trợ tìm kiếm theo từ khóa, phân loại theo danh mục. | Trung bình |
| **UC-09** | Liên hệ & Đăng ký tư vấn | Form đăng ký nhận tư vấn trực tiếp: Họ tên, SĐT, email, dự án quan tâm. Thông tin gửi về hệ thống để nhân viên tiếp nhận và follow-up. | Cao |
| **UC-10** | Bộ lọc phong thủy | Cho phép khách hàng nhập ngày tháng năm sinh, hệ thống tự động tính cung mệnh và gợi ý hướng nhà hợp tuổi, từ đó lọc căn hộ phù hợp từ CSDL. | Trung bình |

### **2.1.2. Phân hệ Quản trị (CMS)**

| Mã UC | Chức năng | Mô tả chi tiết | Ưu tiên |
| :---: | ----- | ----- | :---: |
| **UC-11** | Đăng nhập / Xác thực | Nhân viên và quản trị viên đăng nhập bằng email/mật khẩu. Hỗ trợ "Quên mật khẩu" qua email. Mật khẩu được mã hóa bằng bcrypt. | Cao |
| **UC-12** | Quản lý người dùng | Admin tạo/sửa/xóa tài khoản nhân viên. Phân quyền theo vai trò: Admin, Editor, Viewer. Ghi log lịch sử hoạt động của từng tài khoản. | Cao |
| **UC-13** | Quản lý dự án | Thêm/sửa/xóa dự án. Nhập thông tin: tên, địa chỉ, mô tả, gallery ảnh, vị trí bản đồ, danh sách tiện ích. Quản lý trạng thái: Bản nháp / Đang hiển thị / Đã đóng. | Cao |
| **UC-14** | Quản lý căn hộ | Thêm/sửa/xóa thông tin căn hộ trong từng dự án. Cập nhật thông số: mã căn, diện tích, số phòng, tầng, hướng, giá, phong thủy (mệnh phù hợp). Cập nhật trạng thái bán/thuê. | Cao |
| **UC-15** | Quản lý tiện ích | Thêm/sửa/xóa danh mục tiện ích (hồ bơi, gym, trường học, bệnh viện...). Gán tiện ích cho từng dự án với icon và mô tả. | Trung bình |
| **UC-16** | Quản lý bài viết / tin tức | Soạn thảo bài viết với Rich Text Editor (hỗ trợ ảnh, định dạng văn bản). Đặt lịch đăng, phân loại danh mục, quản lý trạng thái bài đăng. | Trung bình |
| **UC-17** | Quản lý yêu cầu tư vấn | Xem danh sách khách hàng đã gửi form đăng ký tư vấn. Cập nhật trạng thái xử lý (Mới / Đang xử lý / Đã liên hệ). Ghi chú nội dung trao đổi. | Trung bình |
| **UC-18** | Thống kê & Báo cáo | Dashboard hiển thị: số lượt truy cập, số yêu cầu tư vấn mới, dự án được xem nhiều nhất, căn hộ được quan tâm nhất. Biểu đồ theo tuần/tháng. | Thấp |

## **2.2. Yêu cầu phi chức năng**

### **2.2.1. Hiệu năng (Performance)**

* Thời gian tải trang chủ: dưới 3 giây trên kết nối băng thông 20 Mbps.

* Hệ thống đáp ứng đồng thời tối thiểu 200 người dùng mà không giảm hiệu suất đáng kể.

* API backend phản hồi trong vòng 500ms cho các truy vấn thông thường.

* Hình ảnh được tối ưu hóa (nén, lazy loading) để giảm thời gian tải.

### **2.2.2. Bảo mật (Security)**

* Mã hóa mật khẩu người dùng bằng thuật toán bcrypt (salt rounds \>= 10).

* Sử dụng JWT (JSON Web Token) cho xác thực và phân quyền API.

* Áp dụng HTTPS cho toàn bộ giao tiếp client-server.

* Kiểm soát CORS (Cross-Origin Resource Sharing) nghiêm ngặt.

* Phòng chống các lỗ hổng phổ biến: SQL Injection, XSS, CSRF theo chuẩn OWASP Top 10\.

* Giới hạn số lần đăng nhập thất bại (Rate Limiting) để ngăn chặn tấn công brute-force.

### **2.2.3. Khả dụng (Availability & Usability)**

* Giao diện responsive, tương thích với các thiết bị: Desktop (1920x1080), Laptop (1366x768), Tablet (768px), Mobile (375px).

* Hỗ trợ các trình duyệt phổ biến: Chrome, Firefox, Safari, Edge (phiên bản mới nhất).

* Thông báo lỗi rõ ràng, thân thiện với người dùng.

* Website phải đạt điểm Lighthouse Performance \>= 70\.

### **2.2.4. Khả năng bảo trì & Mở rộng (Maintainability & Scalability)**

* Code được tổ chức theo kiến trúc MVC hoặc tương đương, dễ đọc và bảo trì.

* Có tài liệu API (sử dụng Swagger/OpenAPI).

* Database có thể mở rộng khi số lượng dự án và căn hộ tăng lên.

* Hỗ trợ thêm ngôn ngữ (i18n) trong tương lai mà không cần viết lại toàn bộ giao diện.

# **CHƯƠNG 3: THIẾT KẾ HỆ THỐNG**

## **3.1. Kiến trúc tổng thể**

Hệ thống AMG News được xây dựng theo kiến trúc 3 lớp (Three-Tier Architecture) bao gồm:

| Lớp | Thành phần | Nhiệm vụ |
| ----- | ----- | ----- |
| **Presentation Layer** | Frontend | Giao diện người dùng, hiển thị dữ liệu, xử lý tương tác |
| **Business Logic Layer** | Backend | Xử lý nghiệp vụ, API RESTful, tích hợp AI, xác thực |
| **Data Layer** | PostgreSQL | Lưu trữ và quản lý toàn bộ dữ liệu hệ thống |

## **3.2. Công nghệ sử dụng**

| Hạng mục | Công nghệ | Lý do lựa chọn |
| ----- | ----- | ----- |
| **Frontend** | React.js  | SSR/SSG tối ưu SEO, component-based giúp tái sử dụng code, cộng đồng lớn |
| **UI Framework** | Tailwind CSS | Thiết kế nhanh, responsive, dễ tùy chỉnh theo brand AMG |
| **Backend** | fastAPI |  |
| **Database** | PostgreSQL | Dữ liệu có cấu trúc, phù hợp với mô hình quan hệ bất động sản |
| **ORM** | Alembic | Quản lý migration, truy vấn an toàn, giảm rủi ro SQL Injection |
| **AI Chatbot** | Google Gemini API | Mô hình ngôn ngữ lớn mạnh mẽ, hỗ trợ tiếng Việt tốt, chi phí hợp lý |
| **Xác thực** | JWT \+ bcrypt | Tiêu chuẩn công nghiệp cho stateless authentication |
| **Lưu trữ ảnh** | **MinIO**  | Giải pháp lưu trữ đối tượng (Object Storage) tự host, tương thích S3 API, giúp kiểm soát dữ liệu nội bộ và dễ dàng triển khai cục bộ bằng Docker.  |
| **Triển khai** | **Docker**  | Đóng gói ứng dụng (Containerization) cho phép quản lý môi trường nhất quán (DB, Backend, MinIO) và dễ dàng mở rộng.  |

## **3.3. Thiết kế Cơ sở dữ liệu (ERD)**

Hệ thống gồm các thực thể chính sau đây với mối quan hệ được mô tả chi tiết:

### **3.3.1. Danh sách các bảng chính**

| Tên bảng | Mô tả | Các trường chính |
| ----- | ----- | ----- |
| **users** | Tài khoản quản trị hệ thống | id, email, password\_hash, full\_name, role, created\_at, last\_login |
| **projects** | Thông tin dự án bất động sản | id, name, slug, description, location, district, city, price\_from, status, created\_by, created\_at |
| **apartments** | Chi tiết từng căn hộ trong dự án | id, project\_id, code, floor, area, bedrooms, bathrooms, direction, price, status, feng\_shui\_element |
| **amenities** | Danh mục tiện ích | id, name, icon, category (internal/external), description |
| **project\_amenities** | Bảng liên kết dự án \- tiện ích | project\_id, amenity\_id (composite primary key) |
| **floor\_plans** | Mặt bằng tầng của dự án | id, project\_id, floor\_number, image\_url, description |
| **project\_images** | Thư viện ảnh dự án | id, project\_id, image\_url, caption, sort\_order, is\_thumbnail |
| **posts** | Bài viết tin tức thị trường | id, title, slug, content, thumbnail, category\_id, author\_id, status, published\_at |
| **categories** | Danh mục bài viết | id, name, slug, description |
| **contact\_requests** | Yêu cầu tư vấn từ khách hàng | id, full\_name, phone, email, project\_id, message, status, assigned\_to, created\_at |
| **chat\_sessions** | Lịch sử phiên hội thoại Chatbot | id, session\_id, user\_info (JSON), messages (JSON), created\_at |

### **3.3.2. Mối quan hệ giữa các bảng**

* projects (1) \--- (\*) apartments: Một dự án có nhiều căn hộ.

* projects (1) \--- (\*) project\_amenities (\*) \--- (1) amenities: Quan hệ nhiều-nhiều qua bảng trung gian.

* projects (1) \--- (\*) floor\_plans: Một dự án có nhiều mặt bằng tầng.

* projects (1) \--- (\*) project\_images: Một dự án có nhiều hình ảnh.

* users (1) \--- (\*) projects: Một người dùng tạo nhiều dự án.

* categories (1) \--- (\*) posts: Một danh mục chứa nhiều bài viết.

* users (1) \--- (\*) posts: Một người dùng viết nhiều bài.

* contact\_requests (\*) \--- (1) projects: Yêu cầu tư vấn liên kết đến dự án.

# **CHƯƠNG 4: ĐẶC TẢ USE CASE CHI TIẾT**

## **4.1. Sơ đồ Use Case tổng quát**

Hệ thống AMG News có 3 actor chính: Khách hàng (Guest), Nhân viên (Staff), Quản trị viên (Admin). Các use case được phân nhóm theo phân hệ:

* Actor "Khách hàng": UC-01 đến UC-10 (xem thông tin, tìm kiếm, chatbot, liên hệ).

* Actor "Nhân viên": UC-11, UC-13 đến UC-17 (đăng nhập, quản lý nội dung dự án, căn hộ, bài viết, yêu cầu tư vấn).

* Actor "Quản trị viên": Toàn bộ UC-11 đến UC-18 (bao gồm thêm quản lý người dùng và thống kê).

* Quan hệ include: UC-03 includes UC-04 (chi tiết dự án bao gồm xem chi tiết căn hộ).

* Quan hệ extend: UC-06 extends UC-07 (chatbot mở rộng sang gợi ý cá nhân hóa).

## **4.2. Đặc tả Use Case Chi tiết**

### **4.2.1. UC-06: Chatbot AI Tư vấn Phong thủy**

| Thuộc tính | Nội dung |
| ----- | ----- |
| **Mã Use Case** | UC-06 |
| **Tên** | Chatbot AI Tư vấn Phong thủy và Gợi ý Căn hộ |
| **Actor** | Khách hàng (Guest) |
| **Mô tả** | Khách hàng tương tác với chatbot AI để được tư vấn về phong thủy (cung mệnh, hướng nhà phù hợp). Sau đó chatbot gợi ý các căn hộ phù hợp từ cơ sở dữ liệu. |
| **Điều kiện tiên quyết** | Hệ thống đang hoạt động, Gemini API khả dụng, có ít nhất 1 dự án đang mở bán trong CSDL. |
| **Luồng chính** | 1\. Khách hàng mở cửa sổ chat trên website.2. Chatbot chào hỏi và hỏi thông tin (ngày tháng năm sinh, nhu cầu: mua/thuê, ngân sách dự kiến).3. Khách hàng nhập thông tin.4. Hệ thống gọi Gemini API để tính toán cung mệnh, mệnh ngũ hành, hướng nhà hợp tuổi.5. Chatbot trả lời giải thích chi tiết về phong thủy cho khách hàng.6. Hệ thống query CSDL lọc các căn hộ có hướng phù hợp \+ trong ngân sách.7. Chatbot hiển thị tối đa 5 căn hộ gợi ý kèm link chi tiết.8. Khách hàng có thể tiếp tục hỏi hoặc nhấn vào căn hộ gợi ý để xem chi tiết. |
| **Luồng thay thế** | A1: Gemini API không khả dụng → chatbot thông báo tạm thời gián đoạn, gợi ý khách hàng gọi hotline.A2: Không có căn hộ phù hợp → chatbot thông báo và gợi ý mở rộng tiêu chí tìm kiếm. |
| **Điều kiện sau** | Lịch sử hội thoại được lưu vào bảng chat\_sessions. Nếu khách hàng đồng ý, thông tin được ghi vào contact\_requests. |

### **4.2.2. UC-13: Quản lý Dự án**

| Thuộc tính | Nội dung |
| ----- | ----- |
| **Mã Use Case** | UC-13 |
| **Tên** | Quản lý thông tin Dự án bất động sản (CMS) |
| **Actor** | Nhân viên (Staff), Quản trị viên (Admin) |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập thành công vào hệ thống CMS. |
| **Luồng chính (Thêm dự án)** | 1\. Nhân viên chọn "Thêm dự án mới" trong CMS.2. Nhập thông tin: Tên dự án, Địa chỉ, Quận/Huyện, Thành phố, Mô tả tổng quan, Giá khởi điểm.3. Upload hình ảnh (ảnh đại diện \+ gallery).4. Thêm danh sách tiện ích từ danh mục có sẵn.5. Upload mặt bằng tầng điển hình.6. Chọn trạng thái: Bản nháp / Đang hiển thị.7. Nhấn "Lưu" → hệ thống validate dữ liệu và lưu vào CSDL.8. Hệ thống thông báo thành công. |
| **Luồng thay thế** | A1: Dữ liệu bắt buộc bị thiếu → hiển thị thông báo lỗi trên từng trường tương ứng.A2: File upload sai định dạng → thông báo chỉ chấp nhận JPG/PNG/WebP, tối đa 5MB. |

# **CHƯƠNG 5: THIẾT KẾ GIAO DIỆN (UI/UX)**

## **5.1. Nguyên tắc thiết kế**

* Tối giản, chuyên nghiệp: Bảng màu chủ đạo xanh dương đậm (\#1F3864) và trắng, phù hợp với lĩnh vực bất động sản cao cấp.

* Mobile-first: Thiết kế ưu tiên trải nghiệm di động, sau đó mở rộng lên desktop.

* Nhất quán: Dùng hệ thống Design System thống nhất (typography, spacing, component).

* Trực quan: Ảnh chất lượng cao, bố cục thoáng, call-to-action (CTA) rõ ràng.

* Tốc độ: Lazy loading ảnh, skeleton loading khi tải dữ liệu.

## **5.2. Các trang giao diện chính**

| Trang | Thành phần chính | Mô tả chi tiết |
| ----- | ----- | ----- |
| **Trang chủ** | Hero Banner, Dự án nổi bật, Thanh tìm kiếm nhanh, Tin tức mới nhất, CTA liên hệ | Banner slideshow full-width, section dự án dạng card grid (3 cột desktop, 1 cột mobile), nút Chatbot AI nổi ở góc phải màn hình. |
| **Danh sách dự án** | Sidebar lọc, Grid dự án, Phân trang | Layout 2 cột: sidebar bộ lọc bên trái (30%), danh sách dự án bên phải (70%). Dự án hiển thị dạng card với ảnh thumbnail, tên, địa chỉ, giá, badge trạng thái. |
| **Chi tiết dự án** | Gallery ảnh, Tab thông tin, Bản đồ, Danh sách căn hộ | Gallery ảnh dạng lightbox. Tabs: Tổng quan | Tiện ích | Mặt bằng | Căn hộ. Bảng căn hộ có thể lọc theo tầng, số phòng, hướng, tình trạng. Nút "Đặt lịch tư vấn" sticky sidebar. |
| **Chatbot** | Cửa sổ chat floating, Tin nhắn dạng bubble, Card gợi ý căn hộ | Floating button góc phải. Click mở cửa sổ chat 400x600px. Tin nhắn AI/user phân biệt màu sắc. Căn hộ gợi ý hiển thị dạng horizontal scroll card. |
| **CMS Dashboard** | Sidebar menu, Breadcrumb, Content area, Thống kê widget | Layout admin chuẩn: sidebar navigation cố định bên trái, content area chiếm phần còn lại. Dashboard home hiển thị KPI widgets và bảng yêu cầu tư vấn mới nhất. |

# **CHƯƠNG 6: THIẾT KẾ THUẬT TOÁN GỢI Ý CĂN HỘ**

## **6.1. Tổng quan thuật toán**

Hệ thống gợi ý căn hộ AMG News kết hợp hai phương pháp bổ sung cho nhau:

* Rule-based Filtering (Lọc cứng): Loại bỏ các căn hộ không đáp ứng các tiêu chí bắt buộc của khách hàng (ngân sách, diện tích, vị trí). Đây là bước sàng lọc đầu tiên.

* AI-based Scoring (Chấm điểm mềm): Sử dụng Gemini API để phân tích thông tin phong thủy và chấm điểm phù hợp cho các căn hộ đã qua lọc cứng.

## **6.2. Quy trình xử lý**

6. Thu thập dữ liệu đầu vào: Ngày tháng năm sinh → Tính Cung mệnh, Ngũ hành. Ngân sách, Diện tích mong muốn, Vị trí ưu tiên.

7. Bước lọc cứng (Rule-based): Query CSDL lấy danh sách căn hộ status='available' AND price BETWEEN \[min, max\] AND area BETWEEN \[min, max\] AND project.district IN \[preferred\_districts\].

8. Bước chấm điểm phong thủy (AI): Với mỗi căn hộ qua lọc cứng, tính điểm: Hướng nhà hợp mệnh (+40 điểm), Tầng hợp tuổi (+20 điểm), Số phòng ngủ phù hợp (+20 điểm), Gần tiện ích ưu tiên (+20 điểm).

9. Sắp xếp kết quả: Căn hộ được sắp xếp giảm dần theo tổng điểm phong thủy. Trả về tối đa 10 kết quả tốt nhất.

10. Sinh giải thích tự nhiên: Gemini API tạo ra đoạn giải thích ngắn tại sao mỗi căn hộ phù hợp với khách hàng theo ngôn ngữ tự nhiên thân thiện.

## **6.3. Bảng tham chiếu Ngũ hành – Hướng nhà**

| Mệnh | Ngũ hành | Hướng nhà hợp | Hướng kỵ |
| ----- | ----- | ----- | ----- |
| **Kim** | Kim | Tây, Tây Bắc, Tây Nam | Đông, Đông Nam |
| **Mộc** | Mộc | Đông, Đông Nam, Nam | Tây, Tây Bắc |
| **Thủy** | Thủy | Bắc, Đông, Đông Nam | Nam, Tây Nam |
| **Hỏa** | Hỏa | Nam, Đông, Đông Nam | Bắc, Tây Bắc |
| **Thổ** | Thổ | Tây Nam, Đông Bắc, Tây, Tây Bắc | Đông, Đông Nam |

Hà Nội, ngày 18 tháng 3 năm 2026

**Nhóm thực hiện**

\[Chữ ký\]