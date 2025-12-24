import React, { useState, useRef, useEffect } from 'react';

interface ImageLazyLoadProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
  blurDataURL?: string; // 低质量图片占位符
  width?: number;
  height?: number;
}

const ImageLazyLoad: React.FC<ImageLazyLoadProps> = ({
  src,
  alt,
  className = '',
  placeholderColor = '#f1f5f9', // 默认浅灰色占位符
  blurDataURL,
  width,
  height,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 初始化 Intersection Observer
  useEffect(() => {
    // 保存imgRef.current的引用，避免在清理函数中直接使用可能变化的值
    const currentImgRef = imgRef.current;

    // 创建 Intersection Observer 实例
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
      }
    );

    // 开始观察图片元素
    if (currentImgRef) {
      observerRef.current.observe(currentImgRef);
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        if (currentImgRef) {
          observerRef.current.unobserve(currentImgRef);
        }
        observerRef.current.disconnect();
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
        transition: 'background-color 0.3s ease',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
      }}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="h-full w-full scale-105 object-cover blur-sm"
        />
      )}

      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-all duration-300 ${
            isLoaded
              ? 'scale-100 opacity-100 blur-0'
              : 'scale-105 opacity-0 blur-sm'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy" // 原生懒加载作为后备
        />
      )}

      {/* 渐变加载效果 */}
      {!isLoaded && !blurDataURL && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );
};

export default ImageLazyLoad;
