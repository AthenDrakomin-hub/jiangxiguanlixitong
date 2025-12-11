import React, { useState, useRef, useEffect } from 'react';

interface ImageLazyLoadProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}

const ImageLazyLoad: React.FC<ImageLazyLoadProps> = ({ 
  src, 
  alt, 
  className = '',
  placeholderColor = '#f1f5f9' // 默认浅灰色占位符
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 检查浏览器是否支持 IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // 如果不支持，直接加载图片
      setIsInView(true);
      return;
    }

    // 创建 IntersectionObserver 实例
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // 停止观察该元素
            if (imgRef.current) {
              observerRef.current?.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        // 配置选项
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.01 // 只要有一像素进入视口就触发
      }
    );

    // 开始观察图片元素
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    // 清理函数
    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, []);

  // 图片加载完成处理
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // 图片加载错误处理
  const handleImageError = () => {
    // 如果图片加载失败，仍然标记为已加载以显示占位符
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: isLoaded ? 'transparent' : placeholderColor,
        transition: 'background-color 0.3s ease'
      }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy" // 原生懒加载作为后备
        />
      )}
      
      {/* 渐变加载效果 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </div>
  );
};

export default ImageLazyLoad;