
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Mantente al día</h3>
            <p className="text-gray-300 mb-6">Suscríbete para recibir ofertas exclusivas y las últimas novedades</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Tu email" 
                className="bg-white text-gray-900 border-0"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4">LUXE</div>
            <p className="text-gray-400 mb-4">
              Tu destino para moda de alta calidad y estilo contemporáneo.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                123 Fashion St, NY 10001
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                (555) 123-4567
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                info@luxe.com
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Atención al Cliente</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Contacto</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Guía de Tallas</a></li>
              <li><a href="#" className="hover:text-white">Envíos y Devoluciones</a></li>
              <li><a href="#" className="hover:text-white">Cambios</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Acerca de</a></li>
              <li><a href="#" className="hover:text-white">Carreras</a></li>
              <li><a href="#" className="hover:text-white">Sustentabilidad</a></li>
              <li><a href="#" className="hover:text-white">Prensa</a></li>
              <li><a href="#" className="hover:text-white">Inversionistas</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white">Cookies</a></li>
              <li><a href="#" className="hover:text-white">Seguridad</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 LUXE. Todos los derechos reservados.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400 mr-2">Aceptamos:</div>
              <div className="flex space-x-1">
                <div className="bg-white rounded px-2 py-1 text-xs text-gray-900 font-medium">VISA</div>
                <div className="bg-white rounded px-2 py-1 text-xs text-gray-900 font-medium">MC</div>
                <div className="bg-white rounded px-2 py-1 text-xs text-gray-900 font-medium">AMEX</div>
                <div className="bg-white rounded px-2 py-1 text-xs text-gray-900 font-medium">PP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
