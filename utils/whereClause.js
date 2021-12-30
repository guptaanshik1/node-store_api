// base = Product.find()
// biQuery = search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=999

// this will coming to the this

// $option: 'i' for case insensivity, 'g' for global

class WhereClause {
  constructor(base, bigQuery) {
    this.base = base;
    this.bigQuery = bigQuery;
  }

  search() {
    // finding the search keyword in the bigQuery and find the value of search keyword

    // checking whether the search keyword exists in the query or not
    const searchWord = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.search,
            $option: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord }); // appending search word to the rest of the object
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQuery.page) {
      // if page number is coming from query
      currentPage = this.bigQuery.page;
    }

    const valuesToBeSkipped = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(valuesToBeSkipped);
    return this;
  }

  filter() {
    const copyQuery = { ...this.bigQuery }; // holding all values in copyQuery which is an object

    delete copyQuery["search"];
    delete copyQuery["limit"];
    delete copyQuery["page"];

    // categories, price etc will be remaining

    // converting bigQuery into a string => copyQuery
    let stringOfCopyQuery = JSON.stringify(copyQuery);

    stringOfCopyQuery = stringOfCopyQuery.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );

    // converting back to JSON
    const jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

    this.base = this.base.find(jsonOfCopyQuery);

    return this;
  }
}

module.exports = WhereClause;