class GbzinGroupApp {
  constructor() {
    ((this.navbar = document.getElementById("navbar")),
      (this.navToggle = document.getElementById("navToggle")),
      (this.navbarLinks = document.getElementById("navbarLinks")),
      (this.backToTop = document.getElementById("backToTop")),
      (this.dropdownToggles = document.querySelectorAll(".dropdown-toggle")),
      (this.dropdowns = document.querySelectorAll(".nav-dropdown")),
      this.init());
  }
  init() {
    (this.setupNavbarScroll(),
      this.setupNavToggle(),
      this.setupDropdowns(),
      this.setupSmoothScroll(),
      this.setupBackToTop(),
      this.setupScrollAnimations(),
      this.setupActiveSectionHighlight(),
      this.setupKeyboardNavigation());
  }
  setupNavbarScroll() {
    window.addEventListener("scroll", () => {
      (window.scrollY > 50
        ? this.navbar.classList.add("scrolled")
        : this.navbar.classList.remove("scrolled"),
        window.scrollY > 300
          ? this.backToTop.classList.add("visible")
          : this.backToTop.classList.remove("visible"));
    });
  }
  setupNavToggle() {
    this.navToggle.addEventListener("click", () => {
      const e = this.navbarLinks.classList.contains("open");
      (this.navToggle.classList.toggle("active"),
        this.navbarLinks.classList.toggle("open"),
        this.navToggle.setAttribute("aria-expanded", !e),
        (document.body.style.overflow = e ? "" : "hidden"));
    });
  }
  setupDropdowns() {
    (this.dropdownToggles.forEach((e) => {
      e.addEventListener("click", (t) => {
        (t.preventDefault(), t.stopPropagation());
        const s = e.nextElementSibling,
          o = s.classList.contains("open");
        (this.closeAllDropdowns(),
          o ||
            (s.classList.add("open"), e.setAttribute("aria-expanded", "true")));
      });
    }),
      document.addEventListener("click", (e) => {
        e.target.closest(".nav-item") || this.closeAllDropdowns();
      }));
  }
  closeAllDropdowns() {
    (this.dropdowns.forEach((e) => {
      e.classList.remove("open");
    }),
      this.dropdownToggles.forEach((e) => {
        e.setAttribute("aria-expanded", "false");
      }));
  }
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((e) => {
      e.addEventListener("click", (e) => {
        const t = e.getAttribute("href");
        if ("#" === t) return;
        const s = document.querySelector(t);
        if (s) {
          e.preventDefault();
          const e = s.offsetTop - this.navbar.offsetHeight;
          (window.scrollTo({ top: e, behavior: "smooth" }),
            this.closeMobileMenu());
        }
      });
    });
  }
  closeMobileMenu() {
    (this.navbarLinks.classList.remove("open"),
      this.navToggle.classList.remove("active"),
      this.navToggle.setAttribute("aria-expanded", "false"),
      (document.body.style.overflow = ""));
  }
  setupBackToTop() {
    this.backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  setupScrollAnimations() {
    const e = document.querySelectorAll(
        ".servico-card, .stat-card, .ecossistema-card, .projeto-card, .tecnologia-badge",
      ),
      t = new IntersectionObserver(
        (e) => {
          e.forEach((e, s) => {
            e.isIntersecting &&
              ((e.target.style.transitionDelay = s * 0.1 + "s"),
              e.target.classList.add("visible"),
              t.unobserve(e.target));
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
      );
    e.forEach((e) => {
      (e.classList.add("animate-on-scroll"), t.observe(e));
    });
  }
  setupActiveSectionHighlight() {
    const e = document.querySelectorAll("section[id]"),
      t = document.querySelectorAll(".nav-link"),
      s = new IntersectionObserver(
        (e) => {
          e.forEach((e) => {
            if (e.isIntersecting) {
              const s = e.target.id;
              t.forEach((e) => {
                e.classList.remove("active");
                e.getAttribute("href") === `#${s}` && e.classList.add("active");
              });
            }
          });
        },
        { threshold: 0.3 },
      );
    e.forEach((e) => {
      s.observe(e);
    });
  }
  setupKeyboardNavigation() {
    (document.addEventListener("keydown", (e) => {
      "Escape" === e.key && (this.closeMobileMenu(), this.closeAllDropdowns());
    }),
      this.dropdownToggles.forEach((e) => {
        e.addEventListener("keydown", (t) => {
          ("Enter" !== t.key && " " !== t.key) ||
            (t.preventDefault(), e.click());
        });
      }));
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new GbzinGroupApp();

  const stopStyle =
    "font-size: 42px; font-weight: 900; color: #ff4d4d; " +
    "text-shadow: 0 0 8px rgba(255,77,77,.5); letter-spacing: 2px;";

  const titleStyle =
    "font-size: 16px; font-weight: 700; color: #ffcc00; " +
    "padding: 6px 0; letter-spacing: .5px;";

  const bodyStyle =
    "font-size: 13px; color: #ececf1; line-height: 1.6; padding: 2px 0;";

  const warnStyle =
    "font-size: 13px; font-weight: 700; color: #ff8080; " +
    "background: rgba(255,77,77,.12); padding: 6px 10px; " +
    "border-left: 3px solid #ff4d4d; border-radius: 3px;";

  const dividerStyle =
    "font-size: 12px; color: #4a4a58; letter-spacing: 2px;";

  console.log("%c⛔ PARE", stopStyle);

  console.log(
    "%cEsta é uma área restrita do navegador destinada exclusivamente à análise de vulnerabilidades e depuração de segurança.",
    titleStyle
  );

  console.log(
    "%cSe alguém instruiu você a copiar e colar algo aqui, isso é uma tentativa de ataque (Self-XSS). Não prossiga.",
    bodyStyle
  );

  console.log(
    "%cNão insira tokens, cookies, credenciais ou execute comandos nesta janela.",
    bodyStyle
  );

  console.log(
    "%cToda atividade neste console é registrada e pode ser auditada pelo time de segurança da Gbzin Group.",
    warnStyle
  );

  console.log(
    "%c──────────────────────────────────────────────────────────",
    dividerStyle
  );

  console.log(
    "%cGbzin Group · Segurança da Informação · gbzin.group",
    dividerStyle
  );
});