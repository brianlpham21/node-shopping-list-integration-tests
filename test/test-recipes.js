const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list recipe items', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);

        const expectedKeys = ['name', 'ingredients'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('should add a recipe on POST', function() {
    const newItem = {name: 'fried rice', ingredients: ['rice', 'eggs', 'spam']};
    return chai.request(app)
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;

        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  it('should update a recipe on PUT', function() {
    const updatedData = {name: 'spaghetti', ingredients: ['pasta', 'tomato sauce', 'meat']};
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updatedData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updatedData.id}`)
          .send(updatedData);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it('should delete a recipe on DELETE', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
