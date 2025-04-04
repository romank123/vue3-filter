// src/components/ProductCatalog.vue
<template>
  <div class="catalog-container">
    <h1>Каталог товаров</h1>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="loading-container">Загрузка данных...</div>

    <!-- Отображение ошибок -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchData">Попробовать снова</button>
    </div>

    <!-- Отображение данных -->
    <div v-else class="content">
      <!-- Категории -->
      <div class="categories">
        <h2>Категории</h2>
        <ul>
          <li
            v-for="category in categories"
            :key="category.id"
            :class="{ active: selectedCategory === category.name }"
            @click="setCategory(category.name)"
          >
            {{ category.displayName }}
          </li>
          <li
            :class="{ active: selectedCategory === '' }"
            @click="setCategory('')"
          >
            Все товары
          </li>
        </ul>
      </div>

      <!-- Список товаров -->
      <div class="products">
        <div v-if="filteredProducts.length === 0" class="no-products">
          Товары не найдены
        </div>

        <div v-else class="product-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >
            <h3>{{ product.name }}</h3>
            <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
            <div class="product-category">
              {{ getCategoryName(product.category) }}
            </div>
            <div
              class="product-availability"
              :class="{ available: product.available }"
            >
              {{ product.available ? 'В наличии' : 'Нет в наличии' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'ProductCatalog',

  setup() {
    // Состояние данных
    const products = ref([])
    const categories = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedCategory = ref('')

    // Отфильтрованные продукты
    const filteredProducts = computed(() => {
      if (!selectedCategory.value) {
        return products.value
      }

      return products.value.filter(
        product => product.category === selectedCategory.value
      )
    })

    // Получение названия категории
    const getCategoryName = categoryCode => {
      const category = categories.value.find(c => c.name === categoryCode)
      return category ? category.displayName : categoryCode
    }

    // Форматирование цены
    const formatPrice = price => {
      return new Intl.NumberFormat('ru-RU').format(price)
    }

    // Установка выбранной категории
    const setCategory = categoryName => {
      selectedCategory.value = categoryName
    }

    // Загрузка данных
    const fetchData = async () => {
      loading.value = true
      error.value = null

      try {
        // Загрузка категорий
        const categoriesResponse = await axios.get('/api/categories')
        categories.value = categoriesResponse.data.categories
        console.log('f', categories.value)

        // Загрузка товаров
        const productsResponse = await axios.get('/api/products')
        products.value = productsResponse.data.products

        loading.value = false
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        error.value = 'Произошла ошибка при загрузке данных'
        loading.value = false
      }
    }

    // Загрузка данных при монтировании компонента
    onMounted(() => {
      fetchData()
    })

    return {
      products,
      categories,
      loading,
      error,
      selectedCategory,
      filteredProducts,
      getCategoryName,
      formatPrice,
      setCategory,
      fetchData,
    }
  },
})
</script>

<style scoped>
.catalog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.error-container {
  color: #e53935;
}

.error-container button {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.content {
  display: flex;
  gap: 30px;
}

.categories {
  flex: 0 0 250px;
}

.categories ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.categories li {
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 5px;
  transition: background-color 0.2s;
}

.categories li:hover {
  background-color: #f0f0f0;
}

.categories li.active {
  background-color: #e3f2fd;
  font-weight: bold;
}

.products {
  flex: 1;
}

.no-products {
  padding: 40px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-style: italic;
  color: #757575;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-card h3 {
  margin-top: 0;
  font-size: 18px;
}

.product-price {
  font-weight: bold;
  font-size: 20px;
  color: #e53935;
  margin: 10px 0;
}

.product-category {
  display: inline-block;
  background-color: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
}

.product-availability {
  color: #d32f2f;
  font-weight: 500;
}

.product-availability.available {
  color: #388e3c;
}
</style>
