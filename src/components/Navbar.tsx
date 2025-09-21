import { useEffect, useState } from "react";

import { Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "dept", label: "Dept" },
  { id: "facilities", label: "PHC Facilities" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact Us" },
  { id: "programme", label: "Programme" },
] as const;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openModal } = useModal();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavItemClick = (id: (typeof navItems)[number]["id"]) => {
    openModal(id);
    setIsMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signin');
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-green-50 shadow-md py-2" : "bg-green-50/90 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className="text-green-800 hover:text-green-600 font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth Button - Desktop */}
        <button
          onClick={handleAuthClick}
          className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {user ? 'Dashboard' : 'Sign In'}
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-green-800 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg animate-fadeIn">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className="text-green-800 hover:text-green-600 py-2 px-4 text-left font-medium border-b border-green-100 transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            {/* Auth Button - Mobile */}
            <button
              onClick={handleAuthClick}
              className="w-full text-left py-2 px-4 text-white bg-green-600 hover:bg-green-700 font-medium rounded-md transition-colors"
            >
              {user ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
