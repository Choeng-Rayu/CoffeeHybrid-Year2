import styles from './ProductCard.module.css';

const ProductCard = ({ product, onClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      hot: '☕',
      iced: '🧊',
      frappe: '🥤',
      pastry: '🥐',
      sandwich: '🥪',
      dessert: '🍰'
    };
    return icons[category] || '☕';
  };

  const getPriceRange = () => {
    if (!product.sizes || product.sizes.length === 0) {
      return formatPrice(product.basePrice);
    }

    const prices = product.sizes.map(size => product.basePrice + size.priceModifier);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }

    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  const renderRating = () => {
    if (!product.rating) return null;
    
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={styles.star}>★</span>
        ))}
        {hasHalfStar && <span className={styles.star}>½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.star}>☆</span>
        ))}
        <span className={styles.ratingCount}>({product.reviewCount || '0'})</span>
      </div>
    );
  };

  return (
    <article className={styles.productCard} onClick={onClick} aria-label={`${product.name} - ${product.category}`}>
      <div className={styles.productImage}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            loading="lazy"
            width="300"
            height="200"
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span className={styles.categoryIcon}>
              {getCategoryIcon(product.category)}
            </span>
          </div>
        )}
        <div className={styles.categoryBadge}>
          {product.category}
        </div>
        {product.isNew && <div className={styles.newBadge}>New!</div>}
        {product.isPopular && <div className={styles.popularBadge}>Popular</div>}
      </div>

      <div className={styles.productInfo}>
        <header>
          <h3 className={styles.productName}>{product.name}</h3>
          {renderRating()}
        </header>
        
        <p className={styles.productDescription}>{product.description}</p>
        
        <div className={styles.productDetails}>
          <div className={styles.priceInfo}>
            <span className={styles.price}>{getPriceRange()}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizesInfo}>
              <span className={styles.sizesLabel}>Sizes:</span>
              <div className={styles.sizePills}>
                {product.sizes.map(size => (
                  <span key={size.name} className={styles.sizePill}>
                    {size.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {product.addOns && product.addOns.length > 0 && (
            <div className={styles.addOnsInfo}>
              <span className={styles.addOnsLabel}>
                <span className={styles.addOnsIcon}>+</span> Customizable
              </span>
            </div>
          )}
        </div>

        <button className={styles.customizeBtn} aria-label={`Customize and add ${product.name} to cart`}>
          <span className={styles.btnText}>Add to Cart</span>
          <span className={styles.btnIcon}>→</span>
        </button>
      </div>
    </article>
  );
};

export default ProductCard;