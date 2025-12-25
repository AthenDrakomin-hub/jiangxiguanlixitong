import { dbManager } from '../lib/database.js';
import { Dish, DishCategory } from '../types.js';

export interface MenuQuery {
  category?: string;
  search?: string;
  active?: boolean;
}

export const menuAPI = {
  // 获取菜品分类
  async getCategories(): Promise<DishCategory[]> {
    const db = dbManager.getDatabase();
    return await db.getAll<DishCategory>('categories');
  },

  // 获取单个菜品分类
  async getCategory(id: string): Promise<DishCategory | null> {
    const db = dbManager.getDatabase();
    return await db.get<DishCategory>(`categories:${id}`);
  },

  // 创建菜品分类
  async createCategory(category: Omit<DishCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<DishCategory> {
    const db = dbManager.getDatabase();
    
    const newCategory: DishCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return await db.create('categories', newCategory);
  },

  // 更新菜品分类
  async updateCategory(id: string, updates: Partial<DishCategory>): Promise<DishCategory> {
    const db = dbManager.getDatabase();
    
    const existing = await db.get<DishCategory>(`categories:${id}`);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    const updatedCategory: DishCategory = {
      ...existing,
      ...updates,
      id, // Ensure id remains unchanged
      updatedAt: new Date().toISOString()
    };
    
    return await db.update('categories', id, updatedCategory);
  },

  // 删除菜品分类
  async deleteCategory(id: string): Promise<boolean> {
    const db = dbManager.getDatabase();
    return await db.remove('categories', id);
  },

  // 获取菜品
  async getDishes(query?: MenuQuery): Promise<Dish[]> {
    const db = dbManager.getDatabase();
    
    let dishes = await db.getAll<Dish>('dishes');
    
    if (query) {
      if (query.category) {
        dishes = dishes.filter(dish => dish.category === query.category);
      }
      
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        dishes = dishes.filter(dish => 
          dish.name.toLowerCase().includes(searchTerm) ||
          (dish.description && dish.description.toLowerCase().includes(searchTerm))
        );
      }
      
      if (query.active !== undefined) {
        dishes = dishes.filter(dish => dish.available === query.active);
      }
    }
    
    return dishes;
  },

  // 获取单个菜品
  async getDish(id: string): Promise<Dish | null> {
    const db = dbManager.getDatabase();
    return await db.get<Dish>(`dishes:${id}`);
  },

  // 创建菜品
  async createDish(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> {
    const db = dbManager.getDatabase();
    
    const newDish: Dish = {
      ...dish,
      id: `dish_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return await db.create('dishes', newDish);
  },

  // 更新菜品
  async updateDish(id: string, updates: Partial<Dish>): Promise<Dish> {
    const db = dbManager.getDatabase();
    
    const existing = await db.get<Dish>(`dishes:${id}`);
    if (!existing) {
      throw new Error(`Dish with id ${id} not found`);
    }
    
    const updatedDish: Dish = {
      ...existing,
      ...updates,
      id, // Ensure id remains unchanged
      updatedAt: new Date().toISOString()
    };
    
    return await db.update('dishes', id, updatedDish);
  },

  // 删除菜品
  async deleteDish(id: string): Promise<boolean> {
    const db = dbManager.getDatabase();
    return await db.remove('dishes', id);
  },

  // 初始化默认菜单数据
  async initializeDefaultMenu(): Promise<void> {
    const db = dbManager.getDatabase();
    
    // 检查是否已有数据
    const existingCategories = await db.getAll<DishCategory>('categories');
    if (existingCategories.length > 0) {
      return; // 已有数据，不再初始化
    }

    // 创建默认分类
    const defaultCategories: Omit<DishCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '主食',
        name_en: 'Staple Food / Rice',
        description: '饭、面、馒头',
        sortOrder: 1,
        active: true
      },
      {
        name: '特色川菜',
        name_en: 'Sichuan Specialties',
        description: '招牌热菜',
        sortOrder: 2,
        active: true
      },
      {
        name: '凉菜',
        name_en: 'Cold Dishes / Appetizers',
        description: '拍黄瓜、拌面',
        sortOrder: 3,
        active: true
      },
      {
        name: '汤类',
        name_en: 'Soups',
        description: '各种汤',
        sortOrder: 4,
        active: true
      },
      {
        name: '饮品酒水',
        name_en: 'Drinks & Beverages',
        description: '可乐、啤酒、水',
        sortOrder: 5,
        active: true
      },
      {
        name: '烟草杂项',
        name_en: 'Cigarettes & Others',
        description: '烟、日用品',
        sortOrder: 6,
        active: true
      }
    ];

    for (const category of defaultCategories) {
      await db.create('categories', {
        ...category,
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 创建默认菜品
    const defaultDishes: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '白米饭',
        name_en: 'Steamed Rice',
        category: '主食',
        price: 50,
        active: true,
        available: true,
        description: '香喷喷的白米饭',
        image: '',
        ingredients: ['大米'],
        tags: ['主食', '米饭']
      },
      {
        name: '扬州炒饭',
        name_en: 'Yang Chow Fried Rice',
        category: '主食',
        price: 280,
        active: true,
        available: true,
        description: '经典扬州风味炒饭',
        image: '',
        ingredients: ['米饭', '鸡蛋', '火腿', '虾仁'],
        tags: ['主食', '炒饭']
      },
      {
        name: '宫保鸡丁',
        name_en: 'Kung Pao Chicken',
        category: '特色川菜',
        price: 450,
        active: true,
        available: true,
        description: '经典的川菜，酸甜微辣',
        image: '',
        ingredients: ['鸡胸肉', '花生米', '辣椒'],
        tags: ['川菜', '热菜']
      },
      {
        name: '麻婆豆腐',
        name_en: 'Mapo Tofu',
        category: '特色川菜',
        price: 350,
        active: true,
        available: true,
        description: '正宗川菜，麻辣鲜香',
        image: '',
        ingredients: ['豆腐', '肉末', '豆瓣酱'],
        tags: ['川菜', '热菜']
      },
      {
        name: '回锅肉',
        name_en: 'Twice-Cooked Pork Slice',
        category: '特色川菜',
        price: 480,
        active: true,
        available: true,
        description: '川菜经典，肥而不腻',
        image: '',
        ingredients: ['五花肉', '青椒', '蒜苗'],
        tags: ['川菜', '热菜']
      },
      {
        name: '拍黄瓜',
        name_en: 'Smashed Cucumber Salad',
        category: '凉菜',
        price: 200,
        active: true,
        available: true,
        description: '清爽开胃的凉菜',
        image: '',
        ingredients: ['黄瓜', '蒜', '醋'],
        tags: ['凉菜', '开胃菜']
      },
      {
        name: '矿泉水',
        name_en: 'Mineral Water',
        category: '饮品酒水',
        price: 40,
        active: true,
        available: true,
        description: '纯净矿泉水',
        image: '',
        ingredients: ['水'],
        tags: ['饮品', '水']
      },
      {
        name: '可口可乐',
        name_en: 'Coke (Can)',
        category: '饮品酒水',
        price: 60,
        active: true,
        available: true,
        description: '经典可乐',
        image: '',
        ingredients: ['碳酸水', '糖', '焦糖色', '磷酸', '天然香料', '咖啡因'],
        tags: ['饮品', '碳酸饮料']
      },
      {
        name: '青岛啤酒',
        name_en: 'Tsingtao Beer',
        category: '饮品酒水',
        price: 120,
        active: true,
        available: true,
        description: '清爽啤酒',
        image: '',
        ingredients: ['水', '大麦芽', '啤酒花', '酵母'],
        tags: ['饮品', '酒水']
      }
    ];

    for (const dish of defaultDishes) {
      await db.create('dishes', {
        ...dish,
        id: `dish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  },


};