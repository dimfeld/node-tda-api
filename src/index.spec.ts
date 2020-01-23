import { assert } from 'chai';

import { occToTdaSymbol, tdaToOccSymbol } from './index';

describe('occ_to_tda_symbol', function() {
  it('converts a symbol with no cents', function() {
    let occ = 'ANET  180615C00275000';
    let tda = occToTdaSymbol(occ);
    assert.equal(tda, 'ANET_061518C275', occ);
  });

  it('converts a symbol with cents', function() {
    let occ = 'ANET  180615C00275250';
    let tda = occToTdaSymbol(occ);
    assert.equal(tda, 'ANET_061518C275.25', occ);
  });

  it('passes equity symbols through', function() {
    assert.equal(occToTdaSymbol('ANET'), 'ANET');
  });

  it('passes TDA-format symbols through', function() {
    assert.equal(occToTdaSymbol('ANET_061518C275'), 'ANET_061518C275');
  });
});

describe('tda_to_occ_symbol', function() {
  it('converts a symbol', function() {
    let tda = 'NOK_012420C12.5';
    let occ = tdaToOccSymbol(tda);
    assert.equal(occ, 'NOK   200124C00012500');
  });

  it('converts a symbol with no cents', function() {
    let tda = 'NOK_012420C12';
    let occ = tdaToOccSymbol(tda);
    assert.equal(occ, 'NOK   200124C00012000');
  });

  it('converts a symbol with no dollars', function() {
    let tda = 'NOK_012420C.5';
    let occ = tdaToOccSymbol(tda);
    assert.equal(occ, 'NOK   200124C00000500');
  });
})
