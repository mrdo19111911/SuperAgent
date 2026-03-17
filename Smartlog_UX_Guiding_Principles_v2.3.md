

**SMARTLOG ECOSYSTEM**

**UX GUIDING PRINCIPLES**

TMS · WMS · OMS · Supply Chain Planning · Marketplace

**Phiên bản 2.3 (Nâng cấp toàn diện)**  
Tháng 3, 2026

*Mục tiêu: Giảm thiểu thời gian training, UAT và support sau go-live*  
*thông qua trải nghiệm người dùng nhất quán, khả dụng cao và có hệ thống*  
**BẢNG TỔNG HỢP THAY ĐỔI**

| Mục | Loại | Chi tiết |
| :---- | :---- | :---- |
| **1.1** | Sửa đổi | Điều chỉnh targets giảm support 40-60% (thực tế hóa theo B2B) |
| **2.4** | Thêm mới | Accessibility First (WCAG 2.1) và Performance UX chuẩn B2B |
| **3.8** | Thêm mới | Error Recovery UX — Khả năng phục hồi lỗi |
| **5.8** | Thêm mới | Bulk Operations Pattern cho Peak Season |
| **5.9** | Thêm mới | Mobile & Offline-First Patterns |
| **5.10** | Thêm mới | Notification & Alerting Pattern |
| **7.4** | Thêm mới | AI Governance — XAI và phân loại rủi ro |
| **11** | Thêm mới | Security và Privacy UX |
| **12** | Thêm mới | Measurement Framework (HEART) |
| **13** | Thêm mới | Edge Cases và Exception Handling |
| **14** | Thêm mới | Best Practices 2024-2025 (Dark Mode, Sustainability) |

**MỤC LỤC**

# **1\. Tầm nhìn và Triết lý thiết kế**

## **1.1 Tuyên bố tầm nhìn**

*Smartlog Ecosystem được thiết kế để bất kỳ ai tham gia vào chuỗi cung ứng đều có thể hiểu và vận hành hệ thống trong vòng 10 phút đầu tiên, ra quyết định nhanh hơn 30-50%, và giảm 40-60% nhu cầu support sau go-live.*

***Lưu ý về tính khả thi:** Các con số KPI (30-50% tốc độ, 40-60% support) là mục tiêu dựa trên nghiên cứu của Nielsen Norman Group (2023). Kết quả thực tế phụ thuộc vào chất lượng dữ liệu và sự ổn định hạ tầng.*

## **1.2 Bài toán cốt lõi**

Smartlog không phải là phần mềm đơn lẻ mà là hệ sinh thái (ecosystem) gồm nhiều nền tảng kết nối:

| Nền tảng | Vai trò |
| :---- | :---- |
| OMS (Order Management) | Tiếp nhận và quản lý đơn hàng |
| Supply Chain Planning | Lập kế hoạch demand, inventory, production |
| WMS (Warehouse Management) | Quản lý kho, inbound/outbound |
| TMS (Transportation Management) | Vận tải, route, carrier |
| Marketplace | Kết nối shipper, carrier, 3PL, seller |
| Control Tower | Giám sát toàn chuỗi, dự báo, ra quyết định |

**Thách thức lớn nhất:** người dùng không hiểu mental model của hệ thống. Theo McKinsey (2021), 70% dự án chuyển đổi số thất bại do thiếu adoption, không phải do thiếu công nghệ.

## **1.3 Triết lý thiết kế — Ba trụ cột**

**Trụ cột 1: Thiết kế theo cách con người vận hành, không phải cách database lưu trữ.**

Người dùng logistics nghĩ theo workflow (Order → Plan → Execute → Track → Close), không phải theo menu database.

**Trụ cột 2: Hệ thống phải gợi ý quyết định, không chỉ hiển thị dữ liệu.**

Từ form-based data entry chuyển sang decision support system.

**Trụ cột 3: Nhất quán xuyên suốt ecosystem — một ngôn ngữ UX, một mental model.**

Dù user đang dùng WMS, TMS hay OMS, interaction pattern, màu sắc, navigation logic phải giống nhau. Học một, dùng được tất cả.

# **2\. Nền tảng lý thuyết — Systems Thinking trong UX**

## **2.2 Năm nguyên lý Systems Thinking**

**1\. Emergence — Trải nghiệm tổng thể lớn hơn tổng các phần**

Một order từ OMS chuyển sang WMS rồi TMS phải cảm giác như một dòng chảy liên tục.

**2\. Feedback Loops — Mỗi hành động phải có phản hồi rõ ràng**

Khi planner thay đổi route trong TMS, WMS phải phản ánh lại lịch xuất kho mới.

**3\. Interconnectedness — Kết nối là bản chất**

Từ một shipment, user có thể drill-down đến order gốc, warehouse allocation, carrier assignment mà không cần chuyển hệ thống.

**4\. Leverage Points — Tập trung vào điểm đòn bẩy**

Planning Board, Exception Dashboard, và Control Tower là các leverage points tạo impact lớn nhất.

**5\. Mental Models — Thiết kế theo mô hình tư duy của user**

Mỗi role có mental model khác nhau. UX phải map đúng mental model từng role.

## **2.3 Các nguyên lý bổ trợ**

* Gestalt (Proximity & Similarity): Thông tin liên quan phải gần nhau xuyên suốt ecosystem.  
* Hick’s Law: Giảm lựa chọn, tăng tốc quyết định. AI giúp giảm xuống approve/reject.  
* Jakob’s Law: Sử dụng pattern quen thuộc (Cmd+K, Kanban, contextual tips).  
* Progressive Disclosure: User mới chỉ cần 20% feature.  
* **Fitts’s Law:** Nút hành động tối thiểu 44x44 px trên mobile/tablet (Apple HIG). **\[MỚI\]**  
* **Miller’s Law:** Chunking thông tin 7±2 items. Không quá 7 cột dữ liệu chính trong table. **\[MỚI\]**

## **2.4 Nguyên lý bổ sung thiết yếu**

### **2.4.1 Accessibility First (WCAG 2.1 AA)**

Logistics workforce có tỷ lệ người lớn tuổi và hạn chế thị giác cao (Bureau of Labor Statistics, 2022).

* Tất cả color coding phải có secondary indicator (icon, pattern, text) cho người mù màu (\~8% nam giới).  
* Contrast ratio tối thiểu 4.5:1 cho text thường, 3:1 cho large text.  
* Hỗ trợ keyboard navigation cho tất cả thao tác phức tạp.

### **2.4.2 Performance UX cho B2B**

Trong B2B logistics, user có tolerance cao hơn B2C nhưng chậm trễ giảm năng suất.

| Loại thao tác | Thời gian tối đa | Yêu cầu UX |
| :---- | :---- | :---- |
| Simple Actions (Click, Filter) | 100-200ms | Cảm giác tức thì |
| Page Transition / Load | 1-2 giây | Skeleton screen hoặc spinner |
| Complex Reports | 5-10 giây | Bắt buộc Progress Bar \+ Cancel |
| Bulk Operations | 10-60 giây | Background processing \+ notification |

# **3\. 8 Nguyên lý UX cốt lõi cho Smartlog Ecosystem**

## **Nguyên lý 1: Workflow-First Navigation**

| Nền tảng | Workflow Navigation |
| :---- | :---- |
| OMS | Receive Order → Validate → Allocate → Release |
| WMS | Inbound → Put-away → Storage → Pick → Pack → Outbound |
| TMS | Plan → Assign Carrier → Dispatch → In Transit → Delivered |
| SC Planning | Demand Forecast → Supply Plan → Inventory Opt → Execution |
| Marketplace | Discover → Compare → Book → Track → Rate |

## **Nguyên lý 2: Exception-First Dashboard**

Dashboard mặc định hiển thị vấn đề cần xử lý (Exception-driven UX), không phải tổng hợp số liệu.

## **Nguyên lý 3: One-Screen Operations**

Mỗi task cốt lõi hoàn thành trên một màn hình. Target: dưới 3 click.

## **Nguyên lý 4: Visual-First, Data-Second**

Dùng color coding thống nhất, progress bar, drag-and-drop, map-centric UI.

| Màu | Trạng thái | Áp dụng |
| :---- | :---- | :---- |
| \#9E9E9E Grey | Chưa xử lý / Draft | Order mới, Shipment chưa plan |
| \#2196F3 Blue | Đã lên kế hoạch | Planned, Allocated, Assigned |
| \#FF9800 Orange | Đang thực hiện | In Transit, Picking, Processing |
| \#4CAF50 Green | Hoàn thành | Delivered, Received, Closed |
| \#F44336 Red | Lỗi / Trễ | Delayed, Exception, Failed |
| \#9C27B0 Purple | Đang chờ bên ngoài | Pending Carrier, Awaiting Customs |

**Lưu ý Accessibility:** Mọi màu sắc phải có indicator phụ (icon hoặc text label) để hỗ trợ người mù màu.

## **Nguyên lý 5: System-Suggest, Human-Approve**

AI phân tích → Đề xuất → User review → Approve/Adjust. AI không thay thế con người.

## **Nguyên lý 6: Progressive Complexity**

| Tầng | Thời gian | Feature | Mục tiêu |
| :---- | :---- | :---- | :---- |
| Essential | Tuần 1-2 | Core workflow | Task cơ bản |
| Professional | Tuần 3-8 | Optimization, analytics | Tối ưu hiệu suất |
| Expert | Tháng 3+ | AI planning, API config | Khai thác toàn bộ |

## **Nguyên lý 7: Cross-Platform Consistency**

* Navigation: Sidebar cố định \+ top bar contextual  
* Color system: Bảng màu thống nhất ở Nguyên lý 4  
* Component library: Shared design system  
* Terminology: Một thuật ngữ, một định nghĩa xuyên suốt  
* Command Palette: Cmd+K hoạt động ở mọi nền tảng

## **Nguyên lý 8: Error Recovery UX**

**\[MỚI\]** Lỗi không thể tránh khỏi trong logistics. Cách hệ thống xử lý lỗi quyết định niềm tin của user.

| Loại lỗi | Chiến lược UX | Ví dụ |
| :---- | :---- | :---- |
| User Error (Nhập sai) | Inline validation, gợi ý sửa lỗi | "Số lượng phải lớn hơn 0" |
| System Error (Server) | Retry option, auto-save draft | "Mất kết nối. Đã lưu nháp. Thử lại?" |
| Business Logic Error | Giải thích gốc rễ, gợi ý giải pháp | "Không xóa được do Shipment đã xuất kho" |

*Quy tắc Vàng: Mọi Destructive Action (Xóa, Hủy) phải có Undo hoặc Soft Delete (khôi phục trong 30 ngày).*

# **4\. Kiến trúc thông tin xuyên suốt Ecosystem**

## **4.1 Supply Chain Flow**

Customer Order → OMS → SC Planning → WMS → TMS → Control Tower → Marketplace. UX phải giúp user luôn biết vị trí của mình trong dòng chảy này.

## **4.2 Nguyên tắc tổ chức thông tin**

* Drill-down, không Drill-away: Không rời context hiện tại.  
* Breadcrumb xuyên hệ thống: Luôn biết mình ở đâu.  
* Global Entity Search: Một thanh search duy nhất cho toàn ecosystem.

## **4.3 Mental Model theo Role**

| Role | Mental Model | Màn hình | Hành động |
| :---- | :---- | :---- | :---- |
| Logistics Planner | Capacity \+ Route \+ Cost | Planning Board \+ Map | Plan, Optimize |
| Warehouse Operator | Zone \+ Task \+ Sequence | Task List \+ Floor Map | Pick, Pack, Ship |
| Transport Coordinator | Carrier \+ Timeline | Timeline \+ Tracking | Dispatch, Track |
| SC Manager | Demand \+ Supply | Dashboard \+ Forecast | Plan, Approve |
| Marketplace User | Price \+ Service | Search \+ Compare | Discover, Book |
| Executive | KPI \+ Exception | Control Tower | Monitor, Steer |

# **5\. Design Patterns thống nhất**

## **5.1 Control Tower Dashboard**

Pattern quan trọng nhất: KPI cards \+ exception feed \+ AI recommendations.

## **5.2 Planning Board (Kanban)**

Drag-and-drop cho mọi hoạt động lập kế hoạch. Giảm 70% thời gian planning.

## **5.3 Map-Centric Operations**

Map là center UI. TMS: truck routes. WMS: floor plan. Marketplace: carrier coverage.

## **5.4 Timeline View**

Hiển thị sequence và bottleneck theo thời gian.

## **5.5 Recommendation Card**

Pattern thống nhất cho AI suggestion: đề xuất \+ data \+ 3 actions (Approve/Adjust/Reject).

## **5.6 Empty State UX**

Màn hình trống dạy user hành động tiếp theo: tạo mới, import, API, demo data.

## **5.7 Command Palette (Cmd+K)**

Power user điều khiển toàn ecosystem bằng search.

## **5.8 Bulk Operations Pattern**

**\[MỚI\]** Peak season volume tăng 50-200%. Cần pattern thao tác hàng loạt:

* Select All Across Pages: Chọn tất cả items filtered, không chỉ trang hiện tại.  
* Preview Impact: Xem trước ảnh hưởng trước khi thực hiện.  
* Background Processing: Tác vụ lâu (\>5s) chạy ngầm, không block UI.

## **5.9 Mobile và Offline-First Patterns**

**\[MỚI\]** 67% warehouse operations dùng tablet/handheld (Zebra Technologies, 2023).

### **5.9.1 Touch Optimization**

* Touch Target: Tối thiểu 44x44 CSS pixels.  
* Hardware Integration: Hỗ trợ scanner trigger cứng và camera fallback.

### **5.9.2 Offline-First Pattern**

* Optimistic UI: Hiển thị kết quả local trước khi server confirm.  
* Conflict Resolution: "Server wins" cho metadata, "Ask User" cho conflict nghiệp vụ.

## **5.10 Notification và Alerting Pattern**

**\[MỚI\]** Tránh Alert Fatigue:

* Phân loại: System Alert vs. Business Alert vs. Info.  
* Channel phù hợp: In-app toast cho info, Email/Telegram cho Exception nghiêm trọng.

# **6\. Hệ thống Onboarding đa tầng**

## **6.1 Framework: 10-Minute First Success**

User mới phải đạt first success trong 10 phút.

## **6.2 Quy trình Onboarding 5 bước**

**Bước 1 — Welcome & Intent. Bước 2 — Role Selection. Bước 3 — Guided First Task.**

**Bước 4 — See the Value. Bước 5 — Checklist Progress.**

## **6.3 Sandbox Mode**

Demo data: 50 shipments, 10 carriers, 5 warehouses. User hiểu system trong 5 phút.

## **6.4 Onboarding Metrics**

| Metric | Target | Ý nghĩa |
| :---- | :---- | :---- |
| Time to First Success | \< 10 phút | Onboarding hiệu quả |
| First Week Active Rate | \> 70% | User thấy giá trị |
| Feature Adoption Rate | \> 40% core | User dùng feature chính |
| Support Ticket (30 ngày) | \< 5/user | UX đủ rõ |
| Training Time | \< 4 giờ | Giảm từ 2-3 ngày |

# **7\. AI-Augmented UX**

## **7.1-7.3 AI Capabilities & Maturity**

7 năng lực AI: ETA Prediction, Smart Routing, Carrier Recommendation, Demand Forecasting, Exception Prediction, Auto Planning, AI Assistant. 4 maturity levels: Automation → Prediction → Recommendation → Autonomous Planning.

## **7.4 AI Governance trong UX**

**\[MỚI\]** Phân loại quyết định theo rủi ro:

| Risk Level | Ví dụ | AI Behavior | User Interaction |
| :---- | :---- | :---- | :---- |
| Low Risk | Gợi ý điền form, chuẩn hóa địa chỉ | AI Auto-apply | User có thể undo |
| Medium Risk | Gợi ý lộ trình, ghép đơn | AI Đề xuất | User Click Accept |
| High Risk | Thay đổi chuyến bay, split shipment | AI Chỉ Cảnh báo | User Xử Lý Thủ Công |

**Explainability (XAI):** Luôn có nút "Tại sao?" giải thích logic AI. Ví dụ: "Đề xuất route A vì giảm 15% chi phí xăng."

# **8\. Mô hình trưởng thành UX**

**Level 1 — Form System: Training kéo dài.**

**Level 2 — Workflow System: Giảm 50% training.**

**Level 3 — Visual Planning: Giảm 70% thời gian planning.**

**Level 4 — Decision Intelligence: Giảm 40-60% support ticket.**

*Target: Tối thiểu Level 3 trước go-live. Dài hạn: Level 4 toàn ecosystem.*

# **9\. Checklist cho Product Team**

**Navigation & IA**

* Navigation theo workflow thực tế  
* Breadcrumb xuyên ecosystem  
* Cmd+K search hoạt động

**Visual & Interaction**

* Màu trạng thái chuẩn  
* Task dưới 3 click  
* Empty state hướng dẫn

**Intelligence**

* AI suggestion cho quyết định chính  
* Exception dashboard  
* Nút "Tại sao?" cho AI

**Onboarding**

* First success \< 10 phút  
* Sandbox mode  
* Checklist theo role

**Accessibility & Performance**

* Contrast WCAG 2.1 AA  
* Color \+ secondary indicator  
* Keyboard navigation  
* Touch target 44x44px  
* Page load \< 2 giây

**Error Recovery**

* Inline validation  
* Auto-save draft  
* Destructive action có Undo/Soft Delete

# **10\. Anti-patterns cần tránh**

| \# | Anti-pattern | Hệ quả | Giải pháp |
| :---- | :---- | :---- | :---- |
| 1 | Menu theo database | Training dài | Workflow-first |
| 2 | Nhiều form fields | 5-10p/shipment | Auto-fill \+ AI |
| 3 | Nhiều màn hình | 10-15 click | One-screen |
| 4 | Chỉ table | Khó hình dung | Visual board \+ map |
| 5 | Dashboard tổng số | Không biết làm gì | Exception-first |
| 6 | Map là phụ | Mất context | Map-centric |
| 7 | Không demo data | Không hiểu system | Sandbox |

# **11\. Security và Privacy UX**

**\[MỚI\]** Dữ liệu vận chuyển, giá cước, thông tin khách hàng là tài sản nhạy cảm.

## **11.1 RBAC trong UI**

* Ẩn hoàn toàn menu/feature không có quyền (không hiện rồi disable).  
* Data Masking: Giá cước chỉ hiển cho role có quyền. Thông tin KH mask cho carrier/driver.  
* Session: Auto-logout sau 30 phút. MFA cho thao tác nhạy cảm.  
* Audit Trail: Mọi thay đổi dữ liệu quan trọng đều có log (ai, khi nào, giá trị cũ/mới).

## **11.2 Privacy by Design**

* Data Minimization: Chỉ thu thập dữ liệu cần thiết.  
* Consent UX: Tracking GPS/IoT phải có consent rõ ràng.  
* Data Export/Delete: Hỗ trợ GDPR/PDPA compliance.

# **12\. Measurement Framework**

**\[MỚI\]** HEART Framework điều chỉnh cho Logistics B2B:

| Dimension | Metric | Target |
| :---- | :---- | :---- |
| Happiness | CSAT survey hàng quý | ≥ 4.0/5.0 |
| Engagement | DAU / Licensed Users | ≥ 60% |
| Adoption | Feature Adoption Rate (core) | ≥ 40% in month 1 |
| Retention | Monthly Active sau 90 ngày | ≥ 80% |
| Task Success | Completion Rate \+ Time-on-Task | ≥ 95%, giảm 30% time |

## **12.2 Operational Metrics**

| Metric | Target |
| :---- | :---- |
| Time to First Shipment | \< 10 phút |
| Planning Efficiency | Giảm 50% so với manual |
| Exception Resolution Time | \< 15 phút |
| Support Ticket Rate | \< 3/user/month (3 tháng đầu) |
| Training to Competency | \< 1 tuần |

# **13\. Edge Cases và Exception Handling**

**\[MỚI\]** Xử lý các trường hợp đặc biệt trong logistics:

## **13.1 Timezone và Multi-Region**

* Hiển thị timezone abbreviation kèm theo ("15:30 ICT"). Toggle local/destination time.  
* ETA tính theo timezone destination. Report cho chọn timezone reference.

## **13.2 Multi-Currency và Multi-Unit**

* Hiển thị currency code (VND, USD, THB). Hỗ trợ toggle metric/imperial.

## **13.3 Conflict Resolution**

* Optimistic Locking \+ warning khi nhiều user edit cùng entity.  
* Real-time indicators: Avatar người đang edit (giống Google Docs).

## **13.4 Data Migration**

* Import Wizard: Auto-detect column meaning từ Excel/CSV.  
* Parallel Run Mode: Chạy song song hệ thống cũ và mới.

# **14\. Best Practices 2024-2025**

**\[MỚI\]** 

## **14.1 Dark Mode**

* Auto-switch theo system setting hoặc thời gian (sau 18:00).  
* Tất cả status colors có dark mode variant đạt contrast ratio chuẩn.  
* Map và Floor Plan dùng dark tiles.

## **14.2 Sustainability UX (GLEC Framework)**

* Hiển thị CO2 emission bên cạnh cost cho mỗi route option.  
* Green Routing: Filter/sort routes theo carbon footprint.  
* Sustainability Dashboard: ESG reporting, emission trends.  
* Eco-Label: Badge "Green Choice" cho carrier/route emission thấp nhất.

## **14.3 Micro-interactions**

* Success animation khi hoàn thành task.  
* Progress celebration khi hoàn thành onboarding.  
* Smart Defaults: Nhớ preference của user (view mode, filter, sort).

*Living document — cập nhật liên tục theo Product Team, User Research và production data.*  
**Smartlog Ecosystem UX Guiding Principles — v2.3**