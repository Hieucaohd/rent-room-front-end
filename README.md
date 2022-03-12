## First, run the development server:
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Công nghệ sử dụng: 
    Framework: NextJs
    State Management: Zustand
    Style: Ant Design, Sass
    Form Validate: React-Hook-Form
    Data Fetching: Apollo Client

## Tổ chức thư mục
├─ pages: chứa các page của web
    └─ index.tsx: trang chủ
    └─ signin.tsx: đăng nhập
    └─ signup.tsx: đăng kí
    ├─ room
        └─ [id].tsx: thông tin từng phòng theo id
    ├─ user
        └─ [id].tsx: thông tin người dùng theo id
├─ components: chứa components dùng chung giữa các pages
├─ lib: chứa các xử lí logic của component
├─ public: chứa logo
├─ styles: chứa style của các component
