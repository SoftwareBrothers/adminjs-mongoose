/* eslint-disable no-param-reassign */

const escape = require('escape-regexp')

class Filters {
  static getDateFilter({ from, to }) {
    return {
      ...from && { $gte: from },
      ...to && { $lte: to },
    }
  }

  static getDefaultFilter(filter) {
    return {
      $regex: escape(filter), $options: 'i',
    }
  }

  static convertedFilters(filters = {}) {
    return Object.keys(filters).reduce((obj, key) => {
      const currentFilter = filters[key]
      const isDateFilter = currentFilter.from || currentFilter.to
      if (isDateFilter) {
        obj[key] = Filters.getDateFilter(currentFilter)
      } else {
        obj[key] = Filters.getDefaultFilter(currentFilter)
      }
      return obj
    }, {})
  }
}

module.exports = Filters
