<template>
  <div class="property-card" @click="$emit('click')">
    <div class="property-card__image-container">
      <img
        :src="item.picture || '/api/placeholder/400/250'"
        :alt="item.name"
        class="property-card__image"
      />
      <div
        class="property-card__status"
        :class="getStatusClass(item.props.status)"
      >
        {{ item.props.status }}
      </div>
    </div>

    <div class="property-card__content">
      <h3 class="property-card__title h4-semibold">{{ item.name }}</h3>

      <div class="property-card__specs">
        <div class="property-card__spec">
          <span class="property-card__spec-label p3-medium">Площадь</span>
          <span class="property-card__spec-value p2-semibold"
            >{{ formatSquare(item.props.square) }} м²</span
          >
        </div>

        <div class="property-card__spec">
          <span class="property-card__spec-label p3-medium">Стоимость</span>
          <span class="property-card__spec-value p2-semibold"
            >{{ formatPrice(item.props.price) }} ₽</span
          >
        </div>

        <div class="property-card__spec" v-if="pricePerMeter">
          <span class="property-card__spec-label p3-medium">Цена за м²</span>
          <span class="property-card__spec-value p2-semibold"
            >{{ formatPrice(pricePerMeter) }} ₽</span
          >
        </div>
      </div>

      <div class="property-card__specs">
        <div class="property-card__spec" v-if="item.props.date_request_end">
          <span class="property-card__spec-label p3-medium"
            >Дата окончания</span
          >
          <span class="property-card__spec-value p2-semibold">{{
            item.props.date_request_end
          }}</span>
        </div>

        <div class="property-card__spec" v-if="item.props.planning_quarter">
          <span class="property-card__spec-label p3-medium">Квартал</span>
          <span class="property-card__spec-value p2-semibold">{{
            item.props.planning_quarter
          }}</span>
        </div>
      </div>

      <div class="property-card__footer">
        <span
          class="property-card__auction-number p3-medium"
          v-if="item.props.bidding_number"
        >
          № {{ item.props.bidding_number }}
        </span>

        <Button
          type="primary"
          label="Подробнее"
          size="medium"
          class="property-card__button"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from './button'
import { computed } from 'vue'

export default {
  name: 'PropertyCard',
  components: {
    Button,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // Вычисляем цену за квадратный метр
    const pricePerMeter = computed(() => {
      if (props.item.props.price && props.item.props.square) {
        const price = parseFloat(props.item.props.price)
        const square = parseFloat(props.item.props.square)
        if (!isNaN(price) && !isNaN(square) && square > 0) {
          return Math.round(price / square)
        }
      }
      return null
    })

    // Форматирование цены
    const formatPrice = price => {
      if (!price) return '0'
      return new Intl.NumberFormat('ru-RU').format(parseFloat(price))
    }

    // Форматирование площади
    const formatSquare = square => {
      if (!square) return '0'
      return parseFloat(square).toFixed(1)
    }

    // Получение класса для статуса
    const getStatusClass = status => {
      if (status === 'Объявленный') {
        return 'property-card__status--active'
      } else if (status === 'Подготовка к торгам') {
        return 'property-card__status--preparation'
      } else {
        return ''
      }
    }

    return {
      pricePerMeter,
      formatPrice,
      formatSquare,
      getStatusClass,
    }
  },
}
</script>

<style lang="scss" scoped>
@use '@/scss/colors.scss';
@use '@/scss/mixins.scss';
@use '@/scss/typography.scss';

.property-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: colors.$aivazovsky;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }

  &__image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    .property-card:hover & {
      transform: scale(1.05);
    }
  }

  &__status {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    border-radius: 16px;
    background-color: colors.$eyck;
    color: colors.$aivazovsky;
    font-size: 12px;
    font-weight: 500;

    &--active {
      background-color: colors.$boticelli;
    }

    &--preparation {
      background-color: colors.$holbein;
    }
  }

  &__content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  &__title {
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 40px; // Ограничиваем высоту для 2-х строк
  }

  &__specs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__spec {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__spec-label {
    color: colors.$vinci;
    margin-bottom: 4px;
  }

  &__spec-value {
    color: colors.$eyck;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid colors.$matisse;
  }

  &__auction-number {
    color: colors.$vermeer;
  }

  &__button {
    // Дополнительные стили для кнопки, если необходимо
  }
}
</style>
