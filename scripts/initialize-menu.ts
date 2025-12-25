import { menuAPI } from './api/menu.js';

// 初始化菜单数据
const initializeMenuData = async () => {
  console.log('Initializing menu data...');
  
  try {
    // 初始化默认菜单数据
    await menuAPI.initializeDefaultMenu();
    console.log('Menu data initialized successfully!');
    
    // 获取并显示结果
    const categories = await menuAPI.getCategories();
    const dishes = await menuAPI.getDishes();
    
    console.log(`Created ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.name_en})`);
    });
    
    console.log(`\nCreated ${dishes.length} dishes:`);
    dishes.forEach(dish => {
      console.log(`- ${dish.name} (${dish.name_en}) - ₱${dish.price}`);
    });
  } catch (error) {
    console.error('Failed to initialize menu data:', error);
  }
};

// 如果直接运行此文件，则执行初始化
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  initializeMenuData();
}

export { initializeMenuData };