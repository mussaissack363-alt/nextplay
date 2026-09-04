export default function SetupBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-amber-900">
        Almost ready — add your free RAWG API key
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-amber-900/80">
        <li>
          Grab a free key at{" "}
          <a
            href="https://rawg.io/apidocs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2 transition-colors hover:text-orange-600"
          >
            rawg.io/apidocs
          </a>
        </li>
        <li>
          Create{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[13px] text-amber-900 shadow-sm ring-1 ring-amber-200">
            .env.local
          </code>{" "}
          in the project root
        </li>
        <li>
          Add{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[13px] text-amber-900 shadow-sm ring-1 ring-amber-200">
            RAWG_API_KEY=your_key_here
          </code>{" "}
          and restart{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[13px] text-amber-900 shadow-sm ring-1 ring-amber-200">
            npm run dev
          </code>
        </li>
      </ol>
    </div>
  );
}
