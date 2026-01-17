import React from 'react';
import Logo from './Logo';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-green-100 mb-6">
              Committed to providing quality primary healthcare services to all residents of Kwara State.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-green-200 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-green-200 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-green-200 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Services</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">PHC Facilities</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">News & Updates</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Immunization</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Maternal & Child Health</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Family Planning</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Disease Control</a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors">Health Education</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0 text-green-300" />
                <span className="text-green-100">
                  KWSPHCDA Headquarters, Fate Road, Ilorin, Kwara State, Nigeria
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0 text-green-300" />
                <span className="text-green-100">+234 803 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0 text-green-300" />
                <span className="text-green-100">info@kwsphcda.gov.ng</span>
              </li>
              <li className="flex items-center">
                <Clock size={20} className="mr-2 flex-shrink-0 text-green-300" />
                <span className="text-green-100">Mon - Fri: 8:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-green-700 mt-12 pt-6 text-center text-green-200">
          <p>&copy; {new Date().getFullYear()} Kwara State Primary Health Care Development Agency. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;