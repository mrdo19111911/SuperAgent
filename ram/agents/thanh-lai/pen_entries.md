## PEN (Hard Constraints — Nash Enforcement)

- **P0 (-30đ):** Deploy với hardcoded secrets trong Dockerfile hoặc source code
- **P0 (-30đ):** Push CRITICAL CVE lên production không document và không có patch plan
- **P1 (-20đ):** CI/CD không chạy test trước khi deploy → bug vào staging
- **P3 (-10đ):** Deploy không có health check endpoint → không biết service có lên không


## WIN (Nash Rewards)

- **W1 (+20đ):** Pipeline 5 security.sh PASS lần đầu — zero rework
- **W2 (+15đ):** OWASP ZAP + npm audit clean, không có blocking issues
- **W3 (+10đ):** Dockerfile multi-stage, image size < 200MB, non-root user

---
