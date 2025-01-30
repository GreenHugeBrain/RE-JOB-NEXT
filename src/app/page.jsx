import Header from './components/Header/Header'
import styles from './page.module.css'
import Link from 'next/link';
import Footer from './components/Footer/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <section className={styles.hero}>
        <img src="/hero.svg" alt="hero" />
        <div className={styles.hero_div}>
          <div className={styles.hero_text}>
            <h1>შენი უნარები</h1>
            <h2>შენი წარმატებაა</h2>
            <p>დაუკავშირდით საუკეთესო კლიენტებს და აჩვენეთ თქვენი პროფესიული გამოცდილება</p>
          </div>
          <div className={styles.hero_buttons}>
            <Link href="/pages/SignUp"><button>რეგისტრაცია</button></Link>
            <Link href="/pages/SignIn"><button>ავტორიზაცია</button></Link>
          </div>
        </div>
      </section>
      <main className={styles.main}>
        <section className={styles.easy_search}>
          <div className={styles.easy_search_intro}>
            <h3>მარტივი ძებნა</h3>
            <p>დაათვალიერეთ ათასობით პროექტი, რომელიც მორგებულია თქვენს უნარებსა და ინტერესებზე.</p>
            <div style={{ position: 'relative', width: '500px' }}>
              <img src="/search.svg" alt="search" />
              <input type="search" placeholder="ძიება..." />
            </div>
          </div>
          <div className={styles.searched}></div>
        </section>

        <section className={styles.secure_payments}>
          <img src="/payment.svg" alt="" />
          <div className={styles.payment_texts}>
            <h3>უსაფრთხო გადახდები</h3>
            <p>გადაიხადეთ უსაფრთხოდ და დროულად ჩვენი უსაფრთხო გადახდის დაცვით.</p>
          </div>
        </section>

        <section className={styles.easy_search}>
          <div className={styles.easy_search_intro}>
          <h3 style={{ width: '25px' }}>პროფესიული ქსელი</h3>
          <p>შექმენით კავშირები და გაზარდეთ თქვენი პროფესიული პორტფელი.</p> 
          </div>
          <div className={styles.searched}></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
