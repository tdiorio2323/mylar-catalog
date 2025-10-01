export default function Home() {
  const menuItems = [
    { label: 'SHOP', href: 'https://t.me/+mx113PockSVjNzgx', external: true },
    { label: 'INSTAGRAM', href: 'https://www.instagram.com/punkiez.la/', external: true },
    { label: 'LOCATIONS', href: 'https://t.me/+mx113PockSVjNzgx', external: true },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: 'https://t.me/punkiez2025', external: true },
  ];

  return (
    <main>
      <div className="glass w-full rounded-3xl p-8 md:p-10
                max-w-[420px] sm:max-w-[520px] md:max-w-[640px] lg:max-w-[720px]
                shadow-2xl">
        <div className="flex flex-col items-center gap-5">
          {/* Wordmark Logo */}
          <img
            src="/punkiez-logo.png"
            alt="PUNKIEZ"
            className="w-[260px] md:w-[320px] h-auto"
          />

          {/* Title */}
          <h1 className="text-xl font-extrabold tracking-[0.2em] text-center">
            OFFICIAL PUNKIEZ
          </h1>

          {/* Menu Buttons */}
          <div className="w-full space-y-3">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={`Go to ${item.label}`}
                className="menu-btn block w-full rounded-xl border-2 border-black text-center font-bold py-3.5 transition"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Telegram Link */}
          <a
            href="https://t.me/+mx113PockSVjNzgx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join PUNKIEZ on Telegram"
            className="telegram-btn mt-4 block w-full rounded-xl py-3.5 text-center font-bold text-white
                       shadow-lg hover:shadow-xl transition-all"
          >
            JOIN TELEGRAM
          </a>
        </div>
      </div>

      {/* Anchor sections for navigation */}
      <div className="hidden">
        <section id="shop" />
        <section id="flavors" />
        <section id="locations" />
        <section id="about" />
        <section id="contact" />
      </div>
    </main>
  );
}
