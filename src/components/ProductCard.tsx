
import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isWishlisted?: boolean;
  badge?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  isWishlisted = false,
  badge
}) => {
  return (
    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-lg">
          {badge && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded z-10">
              {badge}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white ${
              isWishlisted ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
          
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="w-full">
              <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Añadir al Carrito
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{name}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({reviews})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">${price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">${originalPrice}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
