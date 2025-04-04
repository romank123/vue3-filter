<template>
  <div>
    <div
      class="ds-option-item ds-option-item--tree-parent"
      @click.stop="
        isChildItems(item)
          ? toggleNode(item.id)
          : handleOptionSelect(item.id, item)
      "
    >
      <label class="ds-option-item__checkbox-label">
        <span
          class="ds-option-item__custom-checkbox"
          :class="{
            'ds-option-item__custom-checkbox--checked': isSelected(item.id),
            'ds-option-item__custom-checkbox--indeterminate':
              isIndeterminate(item),
          }"
          @click.stop="handleOptionSelect(item.id, item)"
        ></span>
        {{ item.label }}
      </label>
      <span
        v-if="item.children && item.children.length"
        class="ds-option-item__toggle-btn"
      >
        <svg
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

    <!-- Рекурсивное отображение дочерних элементов -->
    <div
      v-if="item.children && item.children.length && isExpanded"
      class="ds-tree-children"
    >
      <TreeItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :selectedValues="selectedValues"
        :expandedNodes="expandedNodes"
        @select="handleOptionSelect"
        @toggle="toggleNode"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeItem',

  props: {
    item: {
      type: Object,
      required: true,
    },
    selectedValues: {
      type: Array,
      required: true,
    },
    expandedNodes: {
      type: Object,
      required: true,
    },
  },

  computed: {
    isExpanded() {
      return !!this.expandedNodes[this.item.id]
    },
  },

  methods: {
    toggleNode(itemId) {
      this.$emit('toggle', itemId)
    },

    isSelected(id) {
      return this.selectedValues.includes(id)
    },

    isIndeterminate(item) {
      if (!item.children || !item.children.length) {
        return false
      }

      const allChildrenIds = this.getAllChildrenIds(item)
      const selectedChildrenIds = allChildrenIds.filter(id =>
        this.selectedValues.includes(id)
      )
      return (
        selectedChildrenIds.length > 0 &&
        selectedChildrenIds.length < allChildrenIds.length
      )
    },

    isChildItems(item) {
      return item.children && item.children.length
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

    handleOptionSelect(id, item) {
      this.$emit('select', id, item)
    },
  },
}
</script>
