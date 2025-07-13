'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { Html, Image, ProductFragment } from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { ContentEditLink } from '../Molecules/ContentEditLink';
import { PageTransition } from '../Molecules/PageTransition';
import { Price } from '../Molecules/Price';
import { PageHero } from './PageHero';

export function ProductDisplay(product: ProductFragment) {
  const intl = useIntl();
  
  const stockStatus = product.stock > 0 
    ? intl.formatMessage({ id: 'x+t1Jf', defaultMessage: 'In Stock' })
    : intl.formatMessage({ id: 'hiBcId', defaultMessage: 'Out of Stock' });
  const stockStatusColor =
    product.stock > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {product.editLink ? <ContentEditLink {...product.editLink} /> : null}
        {!product.hero && <BreadCrumbs />}
        {product.hero && <PageHero {...product.hero} />}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square">
            {product.teaserImage && (
              <Image
                {...product.teaserImage}
                className="h-full w-full rounded-lg object-cover"
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
                  { sku: product.sku }
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
                    { count: product.stock }
                  )}
                </span>
              )}
            </div>

            {/* Product Description */}
            <div className="prose max-w-none">
              <h3 className="mb-2 text-lg font-semibold">
                {intl.formatMessage({ id: 'Q8Qw5B', defaultMessage: 'Description' })}
              </h3>
              <Html markup={product.description} />
            </div>

            {/* Add to Cart Button (placeholder) */}
            {product.stock > 0 && (
              <button
                className="bg-primary hover:bg-primary-dark w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors"
                onClick={() => {
                  // TODO: Implement add to cart functionality
                  alert('Add to cart functionality to be implemented');
                }}
              >
                {intl.formatMessage({ id: 'Ri//8C', defaultMessage: 'Add to Cart' })}
              </button>
            )}
          </div>
        </div>

        {/* Additional product information sections could go here */}
      </div>
    </PageTransition>
  );
}
