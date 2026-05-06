const wallpaperExamples = [
  {
    title: "Yıl takibi",
    label: "days left",
    description: "Bugünden yıl sonuna kalan günleri sade bir kilit ekranı olarak gör.",
    image:
      "/api/wallpaper?grid=year&theme=midnight&today=2026-05-06&width=828&height=1792&yearDot=18&yearDotGap=6&label=remaining&v=landing-midnight-year",
  },
  {
    title: "Hayat takvimi",
    label: "weeks left",
    description: "Kalan haftalarını daha sakin, daha anlamlı bir arka plana dönüştür.",
    image:
      "/api/wallpaper?grid=life&theme=paper&today=2026-05-06&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=7&lifeDotGap=5&label=remaining&v=landing-paper-life-visible",
  },
  {
    title: "90 günlük hedef",
    label: "days left",
    description: "Kısa dönem hedefini her telefonuna baktığında sessizce hatırla.",
    image:
      "/api/wallpaper?grid=goal&theme=midnight&today=2026-05-06&start=2026-05-06&target=2026-08-04&width=828&height=1792&dot=24&dotGap=8&goalLabel=remaining&v=landing-midnight-goal-90",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Life Calendar Wallpaper</p>
          <h1>Zamanı kilit ekranında sakin bir hatırlatıcıya dönüştür.</h1>
          <p className="lede">
            Hayatını, yılını ve hedeflerini noktalardan oluşan minimal wallpaperlara çevir.
            Uygulama tercihlerini alır, kısayol otomasyonu ise güncel görseli telefonuna taşır.
          </p>
          <div className="store-links" aria-label="Uygulama indirme linkleri">
            <a href="https://www.apple.com/app-store/" rel="noreferrer" target="_blank">
              App Store
            </a>
            <a href="https://play.google.com/store" rel="noreferrer" target="_blank">
              Google Play
            </a>
          </div>
        </div>
        <div className="hero-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wallpaperExamples[0].image} alt="Midnight yıl takibi wallpaper örneği" />
        </div>
      </section>

      <section className="gallery-section" aria-labelledby="examples-title">
        <div className="section-heading">
          <p className="eyebrow">Örnekler</p>
          <h2 id="examples-title">Üç farklı takip, üç temiz wallpaper.</h2>
        </div>
        <div className="wallpaper-grid">
          {wallpaperExamples.map((example) => (
            <article className="wallpaper-card" key={example.title}>
              <div className="wallpaper-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={example.image} alt={`${example.title} wallpaper örneği`} />
              </div>
              <div className="wallpaper-card-copy">
                <div>
                  <h3>{example.title}</h3>
                  <p>{example.description}</p>
                </div>
                <span>{example.label}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shortcut-section" aria-labelledby="shortcut-title">
        <div className="video-panel">
          <div className="play-mark" aria-hidden="true" />
          <p>Shortcut kurulum videosu</p>
        </div>
        <div className="shortcut-copy">
          <p className="eyebrow">Kurulum</p>
          <h2 id="shortcut-title">Kısayolu kur, wallpaper her gün kendini yenilesin.</h2>
          <p>
            Uygulamada tema ve takip türünü seç. Kısayol, arka planda güncel PNG görselini alır ve
            telefonunda kullanman için hazırlar.
          </p>
          <div className="store-links compact" aria-label="Uygulama indirme linkleri">
            <a href="https://www.apple.com/app-store/" rel="noreferrer" target="_blank">
              App Store
            </a>
            <a href="https://play.google.com/store" rel="noreferrer" target="_blank">
              Google Play
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
