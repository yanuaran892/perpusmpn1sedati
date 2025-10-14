import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role }) => {
  return (
    <Card className="bg-white shadow-lg rounded-xl overflow-hidden h-full">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="flex text-yellow-400 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} fill="currentColor" className="h-5 w-5" />
          ))}
        </div>
        <p className="text-gray-600 italic mb-4">"{quote}"</p>
        <div className="mt-auto">
          <p className="font-bold text-primary">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;