import { MoveRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import img1 from '@/public/img-1.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CTA1Props {
  isLoggedIn: boolean;
  shopsRef: React.RefObject<HTMLDivElement>;
}

export const CTA1: React.FC<CTA1Props> = ({ isLoggedIn, shopsRef }) => {
  const router = useRouter();

  const handleAddToCart = () => {
    if (shopsRef.current) {
      shopsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const gotosignuppage = () => {
    router.push('/signup');
  };

  return (
    <div className="w-full pt-20 md:py-20 lg:pt-40">
      <div className="container mx-auto">
        <div className="flex flex-col justify-around rounded-md bg-muted lg:flex-row">
          <div className="flex flex-col items-center gap-8 p-5 text-center lg:p-14">
            <div className="flex flex-col gap-2">
              <h3 className="font-regular max-w-xl text-3xl tracking-tighter md:text-5xl">
                This is something <span className="font-bold"> FAST</span>
              </h3>
              <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground">
                Get your food fast and easy! Place your order in advance and
                savor your meal without the delay!
              </p>
            </div>

            <div className="flex w-full flex-col justify-center gap-4 md:flex-row">
              <Button
                className="w-full gap-4 md:w-auto"
                variant="outline"
                onClick={handleAddToCart}
              >
                Add to Cart <ShoppingCart className="h-4 w-4" />
              </Button>
              {!isLoggedIn && (
                <Button
                  className="w-full gap-4 md:w-auto"
                  onClick={() => gotosignuppage()}
                >
                  Are you a shop owner? <MoveRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Hide image on small screens */}
          <div className="hidden lg:block">
            <Image src={img1} alt="img2" width={650} height={70} />
          </div>
        </div>
      </div>
    </div>
  );
};
