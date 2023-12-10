class ApiFeatures {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  filter() {
    // 1.A Filtering
    const queryObj = { ...this.queryStr };
    const excludedFelids = ['limit', 'sort', 'fields', 'page', 'keyword'];
    excludedFelids.forEach((felid) => delete queryObj[felid]);

    // 1.B Apply filtering gte, gt, lte, lt
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('createdAt');
    }

    return this;
  }

  felidsLimit() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }

    return this;
  }

  search() {
    if (this.queryStr.keyword) {
      const query = {};
      query.$or = [
        { name: { $regex: this.queryStr.keyword, $options: 'i' } },
        { cuisineType: { $regex: this.queryStr.keyword, $options: 'i' } },
      ];

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 50;
    const skip = (page - 1) * limit;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    this.paginationResults = pagination;
    this.mongooseQuery = this.mongooseQuery.find().skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
