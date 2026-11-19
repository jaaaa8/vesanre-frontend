# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Demo nạp coin bằng điện thoại

Mã QR khi nạp coin chứa `paymentUrl` do backend tạo từ `app.payment.fake.base-url` (mặc định `http://localhost:8080`). Quét bằng điện thoại thì `localhost` là chính điện thoại nên trang giả lập không mở được. Frontend không tự sửa `paymentUrl`.

Để demo bằng điện thoại:

1. Chạy backend với cổng giả lập bật và base URL là IP LAN của máy chạy backend:
   ```bash
   SPORTHUB_PAYMENT_FAKE_ENABLED=true \
   SPORTHUB_PAYMENT_FAKE_SECRET=<bí mật bất kỳ> \
   SPORTHUB_PAYMENT_FAKE_BASE_URL=http://<IP LAN>:8080 \
   ./gradlew bootRun
   ```
2. Cho điện thoại dùng cùng mạng Wi-Fi với máy đó.
3. Trên web: Tài khoản → Ví coin → Nạp coin → Tạo mã nạp, rồi quét QR bằng điện thoại và bấm "Xác nhận đã chuyển". Số dư trên web tự tăng khi backend nhận thanh toán.

Không có điện thoại thì bấm "Mở trang thanh toán" ngay trong hộp thoại nạp coin.
