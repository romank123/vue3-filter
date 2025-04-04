<template>
  <div class="ds-multiselect">
    <div v-if="label" class="ds-multiselect__label">{{ label }}</div>
    <div
      class="ds-multiselect__input"
      @click="toggleDropdown"
      :class="{ _open: isOpen, _disable: disabled }"
    >
      <div class="ds-multiselect__selected-items" v-if="selectedLabels.length">
        <span
          class="ds-multiselect__selected-item"
          v-for="(label, index) in formatArrayWithCommas(selectedLabels)"
          :key="index"
        >
          {{ label }}
        </span>
      </div>
      <div class="ds-multiselect__placeholder" v-else>{{ placeholder }}</div>
      <div class="ds-multiselect__icons">
        <button
          v-if="selectedValues.length"
          @click.stop="resetSelection"
          class="ds-multiselect__reset-btn"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.209209 0.209209C0.488155 -0.0697365 0.940416 -0.0697365 1.21936 0.209209L5 3.98985L8.78064 0.209209C9.05958 -0.0697365 9.51184 -0.0697365 9.79079 0.209209C10.0697 0.488155 10.0697 0.940416 9.79079 1.21936L6.01015 5L9.79079 8.78064C10.0697 9.05958 10.0697 9.51184 9.79079 9.79079C9.51184 10.0697 9.05958 10.0697 8.78064 9.79079L5 6.01015L1.21936 9.79079C0.940416 10.0697 0.488155 10.0697 0.209209 9.79079C-0.0697365 9.51184 -0.0697365 9.05958 0.209209 8.78064L3.98985 5L0.209209 1.21936C-0.0697365 0.940416 -0.0697365 0.488155 0.209209 0.209209Z"
              fill="#252628"
            />
          </svg>
        </button>
        <span
          class="ds-multiselect__dropdown-arrow"
          :class="{ 'ds-multiselect__dropdown-arrow--up': isOpen }"
          ><svg
            class="ds-option-item__custom-checkbox-svg"
            :class="{ _open: isExpanded }"
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M11.753 0.869058C11.9987 1.13455 12.0361 1.5884 11.7904 1.8539L6.50907 7.1011C6.22563 7.40745 5.76607 7.40744 5.48263 7.1011L0.210749 1.84189C-0.0349036 1.57639 -0.000290891 1.13964 0.245361 0.874146C0.491014 0.608651 0.974545 0.608497 1.2202 0.873992L6.00253 5.5926L10.7671 0.869027C11.0127 0.603533 11.5074 0.603564 11.753 0.869058Z"
              fill="#252628"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- Десктоп dropdown - размер вьюпорта >= 768px -->
    <div
      class="ds-multiselect__dropdown ds-multiselect__dropdown--desktop"
      v-if="isOpen && !isMobile"
    >
      <div v-if="withSearch" class="ds-multiselect__search-container">
        <input
          type="text"
          v-model="searchQuery"
          class="ds-multiselect__search-input"
          placeholder="найти..."
        />
        <button
          v-if="searchQuery"
          @click.stop="resetSearch"
          class="ds-multiselect__search-input__reset-btn"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.209209 0.209209C0.488155 -0.0697365 0.940416 -0.0697365 1.21936 0.209209L5 3.98985L8.78064 0.209209C9.05958 -0.0697365 9.51184 -0.0697365 9.79079 0.209209C10.0697 0.488155 10.0697 0.940416 9.79079 1.21936L6.01015 5L9.79079 8.78064C10.0697 9.05958 10.0697 9.51184 9.79079 9.79079C9.51184 10.0697 9.05958 10.0697 8.78064 9.79079L5 6.01015L1.21936 9.79079C0.940416 10.0697 0.488155 10.0697 0.209209 9.79079C-0.0697365 9.51184 -0.0697365 9.05958 0.209209 8.78064L3.98985 5L0.209209 1.21936C-0.0697365 0.940416 -0.0697365 0.488155 0.209209 0.209209Z"
              fill="#252628"
            />
          </svg>
        </button>
      </div>
      <simplebar
        class="ds-multiselect__simplebar"
        data-simplebar-auto-hide="false"
      >
        <div class="ds-multiselect__option-list">
          <!-- Список -->
          <template v-if="flat">
            <div
              v-for="option in filteredOptions"
              :key="option.id"
              class="ds-multiselect__option-item"
            >
              <label
                class="ds-multiselect__checkbox-label"
                @click.stop="handleOptionSelect(option.id)"
                :class="{
                  'ds-multiselect__option-item--selected':
                    isSelected(option.id) && singleSelect,
                  _single: singleSelect,
                }"
              >
                <!-- Скрываем чекбокс, если singleSelect = true -->
                <span
                  v-if="!singleSelect"
                  class="ds-multiselect__custom-checkbox"
                  :class="{
                    'ds-multiselect__custom-checkbox--checked': isSelected(
                      option.id
                    ),
                  }"
                  @click.stop="handleOptionSelect(option.id)"
                ></span>
                {{ option.label }}
                <!-- Скрываем чекбокс, если singleSelect = true -->
                <span v-if="singleSelect && isSelected(option.id)">
                  <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M17.4559 0.381759C17.8464 0.772283 17.8464 1.40545 17.4559 1.79597L7.63399 11.6179C7.24347 12.0084 6.61031 12.0084 6.21978 11.6179L0.544121 5.94238C0.153593 5.55186 0.153586 4.91869 0.544106 4.52816C0.934627 4.13763 1.56779 4.13763 1.95832 4.52815L6.92687 9.49659L16.0417 0.381761C16.4322 -0.00876346 17.0654 -0.0087643 17.4559 0.381759Z"
                      fill="#699B12"
                    />
                  </svg>
                </span>
              </label>
            </div>
          </template>
          <!-- Отображаем дерево, если flat = false -->
          <template v-else>
            <TreeItem
              v-for="item in filteredTreeOptions"
              :key="item.id"
              :item="item"
              :selectedValues="selectedValues"
              :expandedNodes="expandedNodes"
              :singleSelect="singleSelect"
              @select="handleOptionSelect"
              @toggle="toggleNode"
            />
          </template>
        </div>
      </simplebar>
    </div>

    <!-- Modal -->
    <ModalComponent v-model="isOpenMobile" :title="placeholder">
      <div class="ds-multiselect__mobile-content">
        <div v-if="withSearch" class="ds-multiselect__search-container">
          <input
            type="text"
            v-model="searchQuery"
            class="ds-multiselect__search-input"
            placeholder="найти..."
          />
          <button
            v-if="searchQuery"
            @click.stop="resetSearch"
            class="ds-multiselect__search-input__reset-btn"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.209209 0.209209C0.488155 -0.0697365 0.940416 -0.0697365 1.21936 0.209209L5 3.98985L8.78064 0.209209C9.05958 -0.0697365 9.51184 -0.0697365 9.79079 0.209209C10.0697 0.488155 10.0697 0.940416 9.79079 1.21936L6.01015 5L9.79079 8.78064C10.0697 9.05958 10.0697 9.51184 9.79079 9.79079C9.51184 10.0697 9.05958 10.0697 8.78064 9.79079L5 6.01015L1.21936 9.79079C0.940416 10.0697 0.488155 10.0697 0.209209 9.79079C-0.0697365 9.51184 -0.0697365 9.05958 0.209209 8.78064L3.98985 5L0.209209 1.21936C-0.0697365 0.940416 -0.0697365 0.488155 0.209209 0.209209Z"
                fill="#252628"
              />
            </svg>
          </button>
        </div>

        <simplebar
          class="ds-multiselect__simplebar"
          data-simplebar-auto-hide="false"
        >
          <div class="ds-multiselect__option-list">
            <!-- Та же разметка от десктопа -->
            <template v-if="flat">
              <div
                v-for="option in filteredOptions"
                :key="option.id"
                class="ds-multiselect__option-item"
              >
                <label
                  class="ds-multiselect__checkbox-label"
                  @click.stop="handleOptionSelect(option.id)"
                  :class="{
                    'ds-multiselect__option-item--selected':
                      isSelected(option.id) && singleSelect,
                    _single: singleSelect,
                  }"
                >
                  <span
                    v-if="!singleSelect"
                    class="ds-multiselect__custom-checkbox"
                    :class="{
                      'ds-multiselect__custom-checkbox--checked': isSelected(
                        option.id
                      ),
                    }"
                    @click.stop="handleOptionSelect(option.id)"
                  ></span>
                  {{ option.label }}
                  <span v-if="singleSelect && isSelected(option.id)">
                    <svg
                      width="18"
                      height="12"
                      viewBox="0 0 18 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17.4559 0.381759C17.8464 0.772283 17.8464 1.40545 17.4559 1.79597L7.63399 11.6179C7.24347 12.0084 6.61031 12.0084 6.21978 11.6179L0.544121 5.94238C0.153593 5.55186 0.153586 4.91869 0.544106 4.52816C0.934627 4.13763 1.56779 4.13763 1.95832 4.52815L6.92687 9.49659L16.0417 0.381761C16.4322 -0.00876346 17.0654 -0.0087643 17.4559 0.381759Z"
                        fill="#699B12"
                      />
                    </svg>
                  </span>
                </label>
              </div>
            </template>

            <template v-else>
              <TreeItem
                v-for="item in filteredTreeOptions"
                :key="item.id"
                :item="item"
                :selectedValues="selectedValues"
                :expandedNodes="expandedNodes"
                :singleSelect="singleSelect"
                @select="handleOptionSelect"
                @toggle="toggleNode"
              />
            </template>
          </div>
        </simplebar>

        <div class="ds-multiselect__mobile-actions">
          <div
            class="ds-multiselect__mobile-button ds-multiselect__mobile-button--reset"
            :class="{ _active: tempMobileSelection.length }"
          ></div>
          <Button
            @onClick="resetSelection"
            label="Сбросить"
            type="outline"
            :disabled="!selectedValues.length"
          >
          </Button>
          <div
            class="ds-multiselect__mobile-button ds-multiselect__mobile-button--confirm"
          ></div>
          <Button
            @onClick="confirmMobileSelection"
            label="Применить"
            type="primary"
          >
          </Button>
        </div>
      </div>
    </ModalComponent>
  </div>
</template>

<script>
import TreeItem from './TreeItem.vue'
import simplebar from 'simplebar-vue'
import ModalComponent from './ModalComponent.vue'
import Button from '../button/Button.vue'
import 'simplebar-vue/dist/simplebar.min.css'
import './multi-select.scss'

export default {
  name: 'MultiSelect',

  components: {
    TreeItem,
    simplebar,
    ModalComponent,
    Button,
  },

  props: {
    options: {
      type: Array,
      required: true,
      default: () => [
        { id: 1, label: '1' },
        { id: 2, label: '2' },
        { id: 3, label: '3' },
      ],
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Выберите элементы',
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    flat: {
      type: Boolean,
      default: false, // По умолчанию отображаем как дерево
    },
    singleSelect: {
      type: Boolean,
      default: false, // По умолчанию разрешаем множественный выбор
    },
    withSearch: {
      type: Boolean,
      default: false, // По умолчанию поиск отключен
    },
    disabled: {
      type: Boolean,
      default: false, // По умолчанию disabled отключен
    },
  },

  data() {
    return {
      isOpen: false,
      isOpenMobile: false,
      searchQuery: '',
      selectedValues: [...(this.modelValue || [])],
      expandedNodes: {}, // Состояние раскрытых узлов
      isMobile: false,
      windowWidth: window.innerWidth,
      tempMobileSelection: [], // Временное хранилище для выбора в мобильной версии
      modalConfirmed: false, // Флаг для отслеживания подтверждения
    }
  },

  computed: {
    isTreeData() {
      return (
        !this.flat &&
        this.options.some(option => option.children && option.children.length)
      )
    },

    filteredOptions() {
      if (!this.searchQuery) return this.options

      const query = this.searchQuery.toLowerCase()
      return this.options.filter(option =>
        option.label.toLowerCase().includes(query)
      )
    },

    filteredTreeOptions() {
      if (this.flat) return [] // Не используем для плоского списка
      if (!this.searchQuery) return this.options

      // Возвращаем отфильтрованные данные, не изменяя исходные
      return this.filterTreeData(this.options, this.searchQuery.toLowerCase())
    },

    selectedLabels() {
      return this.getSelectedLabels(this.options, this.selectedValues).labels
    },

    selectedItems() {
      return this.getSelectedLabels(this.options, this.selectedValues)
        .selectedItems
    },

    structuredModelValue() {
      return this.buildSelectedStructure(this.options)
    },
  },

  watch: {
    structuredModelValue() {
      // Если обычный селект, то по выбору элемента сворачиваем список
      if (this.isOpen && this.singleSelect && !this.isMobile) {
        this.toggleDropdown()
      }
    },
    modelValue: {
      handler(newVal) {
        if (this.isStructuredModelValue(newVal)) {
          this.selectedValues = this.extractIdsFromStructure(newVal)
        } else {
          this.selectedValues = [...(newVal || [])]
        }
      },
      deep: true,
    },
    options: {
      handler() {
        this.initExpandedStates()
      },
      immediate: true,
    },
    searchQuery() {
      this.initExpandedStates()
    },
    windowWidth(newWidth) {
      this.isMobile = newWidth < 768
      if (this.isOpen || this.isOpenMobile) {
        if (this.isMobile) {
          this.isOpen = false
          this.isOpenMobile = true
        } else if (this.isOpenMobile) {
          this.isOpenMobile = false
          this.isOpen = true
        }
      }
    },
    isOpenMobile(newVal, oldVal) {
      newVal
        ? (document.body.style.overflow = 'hidden')
        : (document.body.style.overflow = '')

      // Когда модальное окно закрывается и не было подтверждено
      if (oldVal && !newVal && !this.modalConfirmed) {
        // Возвращаемся к исходному выбору
        this.selectedValues = [...this.tempMobileSelection]
      }
      // При закрытии модального окна закрываем и дропдаун в десктопе
      // Сбрасываем флаг подтверждения при закрытии модального окна
      if (!newVal) {
        this.modalConfirmed = false
        this.isOpen = false
      }
    },
  },

  methods: {
    isStructuredModelValue(value) {
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object' &&
        'id' in value[0]
      )
    },

    extractIdsFromStructure(structure) {
      const ids = []

      const extract = items => {
        items.forEach(item => {
          ids.push(item.id)
          if (item.children && item.children.length) {
            extract(item.children)
          }
        })
      }

      extract(structure)
      return ids
    },

    buildSelectedStructure(options) {
      const result = []

      options.forEach(option => {
        const isSelected = this.isSelected(option.id)
        const hasSelectedChildren =
          option.children &&
          option.children.length &&
          option.children.some(
            child =>
              this.isSelected(child.id) ||
              (child.children &&
                child.children.some(subChild => this.isSelected(subChild.id)))
          )

        if (isSelected || hasSelectedChildren) {
          const newNode = {
            id: option.id,
            label: option.label,
          }

          if (option.children && option.children.length) {
            const selectedChildren = this.buildSelectedStructure(
              option.children
            )
            if (selectedChildren.length > 0) {
              newNode.children = selectedChildren
            }
          }

          result.push(newNode)
        }
      })

      return result
    },

    initExpandedStates() {
      // Сбрасываем состояния раскрытых узлов
      this.expandedNodes = {}

      // Если есть поисковый запрос, раскрываем узлы с совпадениями
      if (this.searchQuery && !this.flat) {
        this.filterTreeData(this.options, this.searchQuery.toLowerCase())
      } else {
        // Если поисковый запрос пуст, восстанавливаем исходное состояние
        this.expandedNodes = this.getDefaultExpandedNodes(this.options)
      }
    },

    getDefaultExpandedNodes(options) {
      const expandedNodes = {}

      const traverse = items => {
        items.forEach((item, index) => {
          if (item.children && item.children.length) {
            // По умолчанию сворачиваем только узлы первого уровня
            expandedNodes[item.id] = false
            traverse(item.children)
          }
        })
      }

      traverse(options)
      return expandedNodes
    },

    toggleDropdown() {
      if (this.disabled) {
        return // Если компонент отключен, прерываем выполнение
      }

      if (this.isMobile) {
        // Мобильная версия
        this.tempMobileSelection = [...this.selectedValues] // Сохраняем текущий выбор перед открытием модального окна
        this.isOpenMobile = !this.isOpenMobile // Открываем/закрываем модальное окно
      } else {
        // Десктопная версия
        this.isOpen = !this.isOpen
      }
    },

    closeDropdown(event) {
      if (this.$el && !this.$el.contains(event.target)) {
        this.isOpen = false
      }
    },

    confirmMobileSelection() {
      this.modalConfirmed = true
      this.isOpenMobile = false
      this.$emit('update:modelValue', this.structuredModelValue)
      this.$emit('change', this.selectedItems)
    },

    isSelected(id) {
      return this.selectedValues.includes(id)
    },

    resetSelection(event) {
      if (event) event.stopPropagation()
      this.selectedValues = []
      this.tempMobileSelection = []
      this.searchQuery = ''
      this.$emit('update:modelValue', [])
      this.$emit('change', [])

      if (!this.isMobile && this.isOpen) {
        this.toggleDropdown()
      }
    },

    resetSearch() {
      this.searchQuery = ''
    },

    filterTreeData(data, query) {
      if (!query) return data // Возвращаем все данные, если запрос пуст

      // Создаем глубокую копию данных для фильтрации
      const filteredData = JSON.parse(JSON.stringify(data)).filter(item => {
        const matchesQuery = item.label.toLowerCase().includes(query)

        if (item.children && item.children.length) {
          item.children = this.filterTreeData(item.children, query)

          // Если текущий узел или его дети соответствуют запросу, раскрываем его
          if (matchesQuery || item.children.length > 0) {
            this.expandedNodes[item.id] = true
          }

          return matchesQuery || item.children.length > 0
        }

        return matchesQuery
      })

      return filteredData
    },

    getSelectedLabels(options, selectedIds) {
      let labels = []
      let selectedItems = []

      const findLabels = items => {
        items.forEach(item => {
          if (selectedIds.includes(item.id)) {
            labels.push(item.label)
            if (!this.areAllImmediateChildrenSelected(item)) {
              selectedItems.push({ [item.id]: item.label })
            }
          }
          if (item.children && item.children.length) {
            findLabels(item.children)
          }
        })
      }

      findLabels(options)
      return { labels, selectedItems }
    },

    findParent(itemId, items = this.options, parent = null) {
      for (const item of items) {
        if (item.id === itemId) return parent
        if (item.children && item.children.length) {
          const found = this.findParent(itemId, item.children, item)
          if (found) return found
        }
      }
      return null
    },

    findItemById(id, items = this.options) {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children && item.children.length) {
          const found = this.findItemById(id, item.children)
          if (found) return found
        }
      }
      return null
    },

    areAllImmediateChildrenSelected(item) {
      if (!item.children || !item.children.length) {
        return false
      }

      return item.children.every(child => this.isSelected(child.id))
    },

    updateParentSelection(parentId) {
      const parent = this.findItemById(parentId)
      if (!parent) return

      const allChildrenSelected = this.areAllImmediateChildrenSelected(parent)
      if (allChildrenSelected && !this.isSelected(parent.id)) {
        this.selectedValues.push(parent.id)
      } else if (!allChildrenSelected && this.isSelected(parent.id)) {
        this.selectedValues = this.selectedValues.filter(
          val => val !== parent.id
        )
      }

      const grandparent = this.findParent(parent.id)
      if (grandparent) {
        this.updateParentSelection(grandparent.id)
      }
    },

    // Клик по элементу
    handleOptionSelect(id, item = null) {
      if (this.singleSelect) {
        // Режим единичного выбора
        // Если разрешен только один выбор, сбрасываем предыдущий выбор
        if (this.selectedValues.includes(id)) {
          // Сбрасываем чек, если элемент выбран
          this.selectedValues = this.selectedValues.filter(val => val !== id)
        } else {
          this.selectedValues = [id]
        }
      } else {
        // Режим множественного выбора
        const isCurrentlySelected = this.isSelected(id)

        if (item && item.children && item.children.length && !this.flat) {
          const allIds = [id, ...this.getAllChildrenIds(item)]
          if (isCurrentlySelected) {
            // Снятие выбора с элемента и всех его дочерних
            this.selectedValues = this.selectedValues.filter(
              val => !allIds.includes(val)
            )
          } else {
            // Выбор элемента и всех его дочерних
            allIds.forEach(itemId => {
              if (!this.selectedValues.includes(itemId)) {
                this.selectedValues.push(itemId)
              }
            })
          }
        } else {
          if (isCurrentlySelected) {
            this.selectedValues = this.selectedValues.filter(val => val !== id)
          } else {
            this.selectedValues.push(id)
          }
        }
      }

      const parent = this.findParent(id)
      if (parent && !this.flat) {
        this.updateParentSelection(parent.id)
      }

      // Эмит события только для десктопной версии
      if (!this.isMobile) {
        this.$emit('update:modelValue', this.structuredModelValue)
        this.$emit('change', this.selectedItems)
      }
    },

    toggleNode(itemId) {
      this.expandedNodes[itemId] = !this.expandedNodes[itemId]
    },

    getAllChildrenIds(item) {
      let ids = []
      const collectIds = node => {
        if (!node.children || !node.children.length) {
          return
        }
        node.children.forEach(child => {
          ids.push(child.id)
          if (child.children && child.children.length) {
            collectIds(child)
          }
        })
      }

      collectIds(item)
      return ids
    },

    formatArrayWithCommas(array) {
      if (array.length <= 1) {
        return array
      }

      return array.map((item, index) => {
        if (index < array.length - 1) {
          return item + ', '
        }
        return item
      })
    },

    // Вызываем по событию ресайза
    onResize() {
      this.windowWidth = window.innerWidth
    },
  },

  mounted() {
    document.addEventListener('click', this.closeDropdown)
    window.addEventListener('resize', this.onResize)
    // Проверка на ширину экрана
    this.isMobile = window.innerWidth < 768
  },

  unmounted() {
    document.removeEventListener('click', this.closeDropdown)
    window.removeEventListener('resize', this.onResize)
  },
}
</script>
