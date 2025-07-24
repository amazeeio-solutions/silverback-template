'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { CartQuery, Html, Image, ProductFragment } from '@custom/schema';
import clsx from 'clsx';
import React, { useState } from 'react';

import { useCart } from '../../stores/cart.store';
import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { ContentEditLink } from '../Molecules/ContentEditLink';
import { PageTransition } from '../Molecules/PageTransition';
import { Price } from '../Molecules/Price';
import { PageHero } from './PageHero';

type CartItemFromQuery = NonNullable<CartQuery['cart']['items'][0]>;

export function ProductDisplay(product: ProductFragment) {
  const intl = useIntl();
  const [isAdding, setIsAdding] = useState(false);

  const { cart, error, addToCart } = useCart();

  const stockStatus =
    product.stock > 0
      ? intl.formatMessage({ id: 'x+t1Jf', defaultMessage: 'In Stock' })
      : intl.formatMessage({ id: 'hiBcId', defaultMessage: 'Out of Stock' });
  const stockStatusColor =
    product.stock > 0 ? 'text-green-600' : 'text-red-600';

  const cartItem = cart?.items.find(
    (item: CartItemFromQuery) => item.id === product.id,
  );
  const canAddToCart =
    product.stock > 0 && (!cartItem || cartItem.quantity < product.stock);

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    setIsAdding(true);
    try {
      await addToCart(product.uuid, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {product.editLink ? <ContentEditLink {...product.editLink} /> : null}
        {!product.hero && <BreadCrumbs />}
        {product.hero && <PageHero {...product.hero} />}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square">
            {product.teaserImage && (
              <Image
                {...product.teaserImage}
                className="size-full rounded-lg object-cover"
              />
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>
              <p className="text-sm text-gray-600">
                {intl.formatMessage(
                  { id: 'im9OV5', defaultMessage: 'SKU: {sku}' },
                  { sku: product.sku },
                )}
              </p>
            </div>

            <div className="text-primary text-2xl font-bold">
              <Price amount={product.price} />
            </div>

            <div className="flex items-center space-x-4">
              <span className={clsx('font-semibold', stockStatusColor)}>
                {stockStatus}
              </span>
              {product.stock > 0 && (
                <span className="text-gray-600">
                  {intl.formatMessage(
                    { id: 'nUWK/3', defaultMessage: '{count} available' },
                    { count: product.stock },
                  )}
                </span>
              )}
            </div>

            {/* Product Description */}
            <div className="prose max-w-none">
              <h3 className="mb-2 text-lg font-semibold">
                {intl.formatMessage({
                  id: 'Q8Qw5B',
                  defaultMessage: 'Description',
                })}
              </h3>
              <Html markup={product.description} />
            </div>

            {/* Add to Cart Button */}
            {product.stock > 0 && (
              <div className="space-y-2">
                <button
                  className={clsx(
                    'w-full rounded-full px-6 py-3 font-semibold text-white transition-colors',
                    canAddToCart
                      ? 'bg-kls-orange-primary hover:bg-kls-orange-accessible'
                      : 'cursor-not-allowed bg-gray-400',
                  )}
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isAdding}
                >
                  {isAdding ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {intl.formatMessage({
                        id: 'Nvr5Ce',
                        defaultMessage: 'Adding...',
                      })}
                    </span>
                  ) : canAddToCart ? (
                    intl.formatMessage({
                      id: 'Ri//8C',
                      defaultMessage: 'Add to Cart',
                    })
                  ) : (
                    intl.formatMessage({
                      id: 'hiBcId',
                      defaultMessage: 'Out of Stock',
                    })
                  )}
                </button>

                {cartItem && (
                  <p className="text-center text-sm text-gray-600">
                    {intl.formatMessage(
                      { id: 'oGmI8+', defaultMessage: '{quantity} in cart' },
                      { quantity: cartItem.quantity },
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional product information sections could go here */}
      </div>
    </PageTransition>
  );
}
