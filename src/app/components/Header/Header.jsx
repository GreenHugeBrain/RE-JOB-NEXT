    'use client'
    import Link from 'next/link'
    import styles from './Header.module.css'
    import { useState, useEffect } from 'react'
    import { useRouter } from 'next/navigation'

    export default function Header() {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [user, setUser] = useState(null);
        const router = useRouter();

        useEffect(() => {
            // Check if user data exists in localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }, []);

        const handleLogout = () => {
            localStorage.removeItem('user');
            setUser(null);
            router.push('/');
        };

        return(
            <header className={styles.header}>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logoLink}>
                        <img src='/logo.png' alt="logo" />
                    </Link>
                    <ul className={styles.navList}>
                        <li><Link href=''>სამუშაოს პოვნა</Link></li>
                        <li><Link href='/pages/Hire'>დაქირავება</Link></li>
                        <li><Link href=''>როგორ მუშაობს</Link></li>
                        {user && (
                            <li className={styles.vectorContainer}>
                                <img 
                                    src="/Vector.png" 
                                    alt="vector" 
                                    onMouseEnter={() => setIsDropdownOpen(true)}
                                />
                                {isDropdownOpen && (
                                    <div 
                                        className={styles.dropdown}
                                        onMouseLeave={() => setIsDropdownOpen(false)}
                                    >
                                        <Link href={`/pages/profile/${user.username}`} className={styles.dropdownItem}>                                            {user.username}
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className={styles.dropdownItem}
                                        >
                                            გასვლა
                                        </button>
                                    </div>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>
            </header>    
        )
    }