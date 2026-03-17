# QUICK_START.md - Kích Hoạt Nash Framework (1 Lệnh)

> **Copy framework sang máy mới? Chỉ cần paste lệnh này vào Claude Code:**

---

## 🚀 1-COMMAND SETUP

Paste lệnh này vào Claude Code chat:

```
Đọc file AUTO_SETUP.md và thực hiện TẤT CẢ các bước setup để kích hoạt Nash Framework.

Chạy từng bước theo thứ tự:
1. Verify framework structure (Bước 1)
2. Activate Nash Factories (Bước 2)
3. Create slash commands (Bước 3)
4. Test everything works (Bước 4)

SAU MỖI BƯỚC: Báo cáo kết quả (PASS/FAIL).

CUỐI CÙNG: Hiển thị summary checklist.
```

**Thời gian:** 2-5 phút (agent tự động làm hết)

---

## ✅ Kết Quả Mong Đợi

Sau khi agent chạy xong, bạn sẽ có:

```
✅ Nash CLI works: node bin/nash list-skills → 2 skills
✅ Slash commands: /sharpen, /upgrade-agent
✅ Gate scripts: bash gates/validate.sh works
✅ Dashboard: observability/dashboard-simple.html opens
✅ Factories: Agent sharpening fully operational
```

---

## 🔄 Reload VSCode

**QUAN TRỌNG:** Sau khi setup xong, reload VSCode để kích hoạt slash commands:

- **Windows/Linux:** `Ctrl+Shift+P` → "Developer: Reload Window"
- **Mac:** `Cmd+Shift+P` → "Developer: Reload Window"

Sau đó gõ `/` trong chat → Thấy `/sharpen` và `/upgrade-agent`

---

## 📋 Nếu Gặp Lỗi

### Lỗi: "Skills not found"

```bash
# Agent sẽ tự động copy từ deprecated:
cp -r deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_reactive agents/skills/
cp -r deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_proactive agents/skills/
```

### Lỗi: "Registry empty"

```bash
# Agent sẽ tự động register skills:
node bin/nash register-skill sharpener_reactive
node bin/nash register-skill sharpener_proactive
```

### Lỗi: "Slash commands not appearing"

```bash
# Agent sẽ tự động tạo:
mkdir -p .claude/commands
# → Tạo sharpen.md, upgrade-agent.md
```

**Sau đó:** Reload VSCode (Ctrl+R)

---

## 🎯 Test Framework Hoạt Động

Sau khi setup + reload VSCode, test:

```bash
# Test 1: Nash CLI
node bin/nash list-skills

# Test 2: Slash commands
/sharpen agents/core/dung-manager.md

# Test 3: Gate scripts
bash gates/validate.sh --help

# Test 4: Dashboard
# Open observability/dashboard-simple.html in browser
```

---

## 📖 Chi Tiết Đầy Đủ

Xem [AUTO_SETUP.md](AUTO_SETUP.md) để hiểu chi tiết từng bước agent làm gì.

---

**TL;DR:** Copy framework → Paste 1 lệnh vào Claude Code → Đợi 2-5 phút → Done! 🎉
