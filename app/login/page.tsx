export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="login-wrap">
      <form
        className="login-card grid"
        action="/api/auth/login"
        method="POST"
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          <img
            src="/logo.jpg"
            alt="ББЦТС ТӨХК"
            style={{
              width: 180,
              maxHeight: 120,
              objectFit: "contain",
              marginBottom: 15,
            }}
          />

          <h1 style={{ marginBottom: 8 }}>
            Бичиг баримтын систем
          </h1>

          <div className="muted">
            Баруун бүсийн цахилгаан түгээх сүлжээ ТӨХК
          </div>
        </div>

        <div>
          <label className="label">
            Хэрэглэгчийн нэр
          </label>

          <input
            className="input"
            type="text"
            name="username"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="label">
            Нууц үг
          </label>

          <input
            className="input"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          className="btn"
          type="submit"
          style={{ width: "100%" }}
        >
          Нэвтрэх
        </button>
      </form>
    </div>
  );
}