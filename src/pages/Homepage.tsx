
import React from 'react';
import { ChevronRight, Truck, RotateCcw, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const Homepage = () => {
  const featuredProducts = [
    {
      id: '1',
      name: 'Blazer Elegante de Lana',
      price: 299,
      originalPrice: 399,
      image: '/placeholder.svg',
      rating: 4.8,
      reviews: 124,
      badge: '-25%'
    },
    {
      id: '2',
      name: 'Vestido Midi Floral',
      price: 149,
      image: '/placeholder.svg',
      rating: 4.6,
      reviews: 89,
      isWishlisted: true
    },
    {
      id: '3',
      name: 'Camisa Oxford Premium',
      price: 89,
      image: '/placeholder.svg',
      rating: 4.9,
      reviews: 203
    },
    {
      id: '4',
      name: 'Pantalón Chino Slim',
      price: 79,
      originalPrice: 99,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 156,
      badge: 'NUEVO'
    }
  ];

  const testimonials = [
    {
      name: "María González",
      text: "Calidad excepcional y envío súper rápido. Definitivamente volveré a comprar.",
      rating: 5
    },
    {
      name: "Carlos Ruiz",
      text: "El mejor servicio al cliente que he experimentado. Productos de primera calidad.",
      rating: 5
    },
    {
      name: "Ana López",
      text: "Me encanta la variedad de productos y los precios son muy competitivos.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-r from-gray-900 to-gray-700 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Nueva Colección
              <span className="block text-blue-400">Primavera 2024</span>
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Descubre las últimas tendencias en moda con nuestra colección cuidadosamente seleccionada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                Explorar Colección
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Ver Ofertas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Envío Gratuito</h3>
              <p className="text-gray-600 text-sm">En compras superiores a $99</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Devoluciones Fáciles</h3>
              <p className="text-gray-600 text-sm">30 días para cambios</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Compra Segura</h3>
              <p className="text-gray-600 text-sm">Protección 100% garantizada</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Soporte 24/7</h3>
              <p className="text-gray-600 text-sm">Asistencia siempre disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra selección especial de productos más populares y mejor valorados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Ver Todos los Productos
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Banner */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="relative h-80 bg-gradient-to-br from-pink-400 to-purple-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">Colección Femenina</h3>
                    <p className="mb-4">Elegancia y sofisticación</p>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                      Explorar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="relative h-80 bg-gradient-to-br from-blue-500 to-teal-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">Colección Masculina</h3>
                    <p className="mb-4">Estilo contemporáneo</p>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                      Explorar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-gray-600">Miles de clientes satisfechos respaldan nuestra calidad</p>
          </div>
          
          <Carousel className="max-w-4xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full mx-0.5"></div>
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
