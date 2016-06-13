import assert from 'assert';
import fileExists from 'file-exists';
import tmpDir from 'os-tmpdir';
import fs from 'fs';
import rewire from 'rewire';
import q from 'q';

const treePic = rewire('../');

describe('tree-pic', function() {
  describe('es6', function() {
    beforeEach(function() {
      this._directory = `${__dirname}/es6`;
      this._tmpDirectory = tmpDir();
    });

    it('rejects if a filename is not supplied', function(done) {
      treePic({
        directory: this._directory
      })
      .catch(({message}) => {
        assert.equal(message, 'filename not provided');
        done();
      });
    });

    it('rejects if a directory is not supplied', function(done) {
      treePic({
        filename: `${this._directory}/index.js`
      })
      .catch(({message}) => {
        assert.equal(message, 'directory not provided');
        done();
      });
    });

    it('rejects if graphviz is not installed', function(done) {
      const revert = treePic.__set__('checkGraphvizBinary', function() {
        return q.fcall(() => {
          throw new Error();
        });
      });

      const filename = `${this._directory}/index.js`;
      const expectedImagePath = `${this._directory}/Tree_for_index.png`;

      return treePic({
        filename,
        directory: this._directory
      }).catch(({message}) => {
        assert.equal(message, 'Graphviz could not be found. Ensure that "gvpr" is in your $PATH.');
        revert();
        done();
      });
    });

    it('returns the filepath of the generated image for a given file', function() {
      const filename = `${this._directory}/index.js`;
      const expectedImagePath = `${this._directory}/Tree_for_index.png`;

      return treePic({
        filename,
        directory: this._directory
      }).then(imagePath => {
        assert.equal(imagePath, expectedImagePath);
        fs.unlinkSync(expectedImagePath);
      });
    });

    it('uses the given imagePath as the name of the image', function() {
      const filename = `${this._directory}/index.js`;
      const desiredPath = `${this._tmpDirectory}/sweetImageBruh.png`;

      return treePic({
        filename,
        directory: this._directory,
        imagePath: desiredPath
      }).then(imagePath => {
        assert.equal(imagePath, desiredPath);
      });
    });

    it('creates the image file on disk', function() {
      const filename = `${this._directory}/index.js`;
      const desiredPath = `${this._tmpDirectory}/sweeter.png`;

      return treePic({
        filename,
        directory: this._directory,
        imagePath: desiredPath
      }).then(imagePath => {
        assert.ok(fileExists(imagePath));
      });
    });
  });
});
