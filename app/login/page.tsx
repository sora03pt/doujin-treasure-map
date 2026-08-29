import { AuthForm } from "@/features/auth/components/auth-form";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 dark:bg-slate-950 dark:text-slate-50">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="mb-6 space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Doujin Treasure Map
            </p>
            <h1 className="text-3xl font-semibold tracking-normal">
              ログイン
            </h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              自分専用のイベント地図を安全に管理します。
            </p>
          </header>
          {message ? (
            <p
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
              role="alert"
            >
              {message}
            </p>
          ) : null}
          <AuthForm />
        </div>
      </section>
    </main>
  );
}
