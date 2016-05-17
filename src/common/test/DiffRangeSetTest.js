var expect = require("chai").expect;
var DiffRangeSet = require("../src/DiffRangeSet");
var gen = require('random-seed');
var qintervals = require('qintervals');
function rng(...items) {
    if (items.length == 1 && typeof items[0] == 'string') {
        items = items[0].split(/\s+/).map(Number);
    }
    var r = [];
    if (items.length % 2 == 1) {
        throw new Error('Odd number of numbers, cannot create ranges');
    }
    for (var i = 0; i < items.length; i += 2) {
        r.push({start: items[i], end: items[i + 1]});
    }
    return r;
}

describe("DiffRangeSet", ()=> {
    before(()=> {
    });
    describe('_computeNextStep test', ()=> {
        var leftSet = [];
        var rightSet = [];
        var A, B, C, D, E, F, G, K, L, M, N, O, P;
        before(()=> {
            /*
             *  1    / K
             *  2   A  K
             *  3   A  K
             *      A\
             *  5   A  L
             *         L
             *       / L
             *  8   B  L
             *  9   B  L
             *      |  L
             * 11   C  L
             * 12   C  L
             *      |  L
             * 14   D  L
             * 15   D  L
             *      |  L
             * 17   E  L
             * 18   E
             *      |
             * 20   F
             * 21   F\ M
             * 22   F  M
             * 23   F  N
             * 24   F  N
             *       /
             * 26   G
             *      G
             * 28   G
             *       \
             * 30      O
             * 31      O
             *         |
             * 33      P
             * 34      P
             *
             */
            var addLeft = (start, end) => {
                var x = rng(start, end);
                leftSet = leftSet.concat(x);
                return leftSet.length - 1;
            };
            var addRight = (start, end) => {
                var x = rng(start, end);
                rightSet = rightSet.concat(x);
                return rightSet.length - 1;
            };
            A = addLeft(2, 5);
            B = addLeft(8, 9);
            C = addLeft(11, 12);
            D = addLeft(14, 15);
            E = addLeft(17, 18);
            F = addLeft(20, 24);
            G = addLeft(26, 28);
            K = addRight(1, 3);
            L = addRight(5, 17);
            M = addRight(21, 22);
            N = addRight(23, 24);
            O = addRight(31, 31);
            P = addRight(33, 34);
        });
        it('_computeNextStep should move to closer element -1 -1', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, -1, -1)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element -1 K', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, -1, K)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element A K', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, A, K)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element A L', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, A, L)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element B L', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, B, L)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element C L', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, C, L)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element D L', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, D, L)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element E L', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, E, L)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element F L', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, F, L)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element F M', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, F, M)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element F N', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, F, N)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element G N', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, G, N)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element G O', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, G, O)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element G P', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, G, P)).to.be.null;
        });
        it('_computeNextStep should move to closer element F K', ()=> {
            expect(DiffRangeSet._computeNextStep(leftSet, rightSet, F, K)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element when next are equal', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('6 7 10 11'), rng('8 9 10 11'), 0, 0)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should move to closer element when next are equal', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('8 9 10 11'), rng('6 7 10 11'), 0, 0)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should move to closer element when next and prev are equal', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('8 9 10 11'), rng('8 9 10 11'), 0, 0)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should return null for empty sets', ()=> {
            expect(DiffRangeSet._computeNextStep([], [], 0, 0)).to.be.null;
        });
        it('_computeNextStep should return null for empty left set', ()=> {
            expect(DiffRangeSet._computeNextStep([], rng('0 1 2 3'), 0, 0)).to.have.property('kind', 'right');
            expect(DiffRangeSet._computeNextStep([], rng('0 1 2 3'), 0, 1)).to.be.null;
        });
        it('_computeNextStep should return good direction at start', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('0 1'), rng('2 3'), -1, -1)).to.have.property('kind', 'left');
            expect(DiffRangeSet._computeNextStep(rng('2 3'), rng('0 1'), -1, -1)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should return good direction at 0 -1', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('0 2   3 6'), rng('3 11'), 0, -1)).to.have.property('kind', 'right');
        });
        it('_computeNextStep should return good direction at -1 0', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('3 11'), rng('0 2   3 6'), -1, 0)).to.have.property('kind', 'left');
        });
        it('_computeNextStep should return good direction at -1 -1', ()=> {
            expect(DiffRangeSet._computeNextStep(rng('0 1 3 13'), rng('0 4   6 9'), -1, -1)).to.have.property('kind', 'left');
        });
    });
    describe("_getUnionRelation test", ()=> {
        it('basic test', ()=> {
            expect(DiffRangeSet._computeUnionRelation({start: 0, end: 3}, {start: 2, end: 4}))
                .to.be.deep.equal({isResizing: true, start: 0, end: 4, isEndChanged: true});
            expect(DiffRangeSet._computeUnionRelation({start: 0, end: 3}, {start: 4, end: 5}))
                .to.be.deep.equal({isAfter: true});
            expect(DiffRangeSet._computeUnionRelation({start: 3, end: 4}, {start: 0, end: 2}))
                .to.be.deep.equal({isBefore: true});
            expect(DiffRangeSet._computeUnionRelation({start: 4, end: 5}, {start: 3, end: 7}))
                .to.be.deep.equal({start: 3, end: 7, isStartChanged: true, isEndChanged: true, isResizing: true});
            expect(DiffRangeSet._computeUnionRelation({start: 0, end: 4}, {start: 4, end: 5}))
                .to.be.deep.equal({isResizing: true, start: 0, end: 5, isEndChanged: true});
            expect(DiffRangeSet._computeUnionRelation({start: 0, end: 4}, {start: 0, end: 5}))
                .to.be.deep.equal({isResizing: true, start: 0, end: 5, isEndChanged: true});
            expect(DiffRangeSet._computeUnionRelation({start: 4, end: 5}, {start: 0, end: 5}))
                .to.be.deep.equal({isResizing: true, start: 0, end: 5, isStartChanged: true});
            expect(DiffRangeSet._computeUnionRelation({start: 2, end: 5}, {start: 3, end: 4}))
                .to.be.deep.equal({isIncluded: true});
            expect(DiffRangeSet._computeUnionRelation({start: 2, end: 5}, {start: 0, end: 4}))
                .to.be.deep.equal({isResizing: true, start: 0, end: 5, isStartChanged: true});
            expect(DiffRangeSet._computeUnionRelation({start: 2, end: 3}, {start: 0, end: 5}))
                .to.be.deep.equal({isResizing: true, start: 0, end: 5, isStartChanged: true, isEndChanged: true});
            expect(DiffRangeSet._computeUnionRelation({start: 10, end: 11}, {start: 10, end: 11}))
                .to.be.deep.equal({isEqual: true});

        });
    });
    describe("Add test", ()=> {
        it("simple two non-overlapping ranges", ()=> {
            expect(DiffRangeSet.add(rng('0 2'), rng('3 5'))).to.have.property('added').that.deep.equals(rng('3 5'));
        });
        it('new ranges "inside" old, non-overlapping', ()=> {
            expect(DiffRangeSet.add(rng('0 1 4 5'), rng('2 3'))).to.have.property('added').that.deep.equals(rng('2 3'));
        });
        it('new ranges "inside" old, non-overlapping v2', ()=> {
            expect(DiffRangeSet.add(rng('0 1 4 5 8 9'), rng('2 3 6 7'))).to.have.property('added').that.deep.equals(rng('2 3 6 7'));
        });
        it('new ranges include earlier and latter, non-overlapping', ()=> {
            expect(DiffRangeSet.add(rng('2 3 6 7 10 11'), rng('0 1 4 5 8 9 12 13'))).to.have.property('added').that.deep.equals(rng('0 1 4 5 8 9 12 13'));
        });
        it('new ranges are included in existing ranges, touching', ()=> {
            expect(DiffRangeSet.add(rng('2 10'), rng('2 3 3 4 4 5 5 6 6 7 7 8 8 9 9 10'))).to.have.property('added').that.is.empty;
        });
        it('new ranges include earlier and latter, some are included in existing ranges', ()=> {
            expect(DiffRangeSet.add(rng('2 3 6 7 10 11'), rng('0 1 4 5 6.4 6.5 8 9 10 11 12 13'))).to.have.property('added').that.deep.equals(rng('0 1 4 5 8 9 12 13'));
        });
        it('new ranges are quals to the existing ones', ()=> {
            expect(DiffRangeSet.add(rng('0 1 2 3 4 5'), rng('0 1 2 3 4 5'))).to.have.property('added').that.is.empty;
        });
        it('new ranges have quals to the existing ones', ()=> {
            expect(DiffRangeSet.add(rng('0 1 4 5'), rng('0 1 2 3 4 5'))).to.have.property('added').that.deep.equals(rng('2 3'))
        });
        it("should return info about resized ranges", ()=> {
            expect(DiffRangeSet.add(rng('0 1 4 5'), rng('1 2 3 7'))).to.have.property('resized').that.is.deep.equal([
                {range: {start: 0, end: 1}, start: 0, end: 2, isEndChanged: true},
                {range: {start: 4, end: 5}, start: 3, end: 7, isStartChanged: true, isEndChanged: true}
            ]);
        });
        it('should merge two ranges', ()=> {
            var ret = DiffRangeSet.add(rng('1 2 4 5'), rng('0 3 3 6'));
            expect(ret.resized).to.be.deep.equal([
                {range: {start: 1, end: 2}, start: 0, end: 6, isStartChanged: true, isEndChanged: true}
            ]);
            expect(ret.removed).to.be.deep.equal([
                {start: 4, end: 5}
            ]);
        });
        it("one item resized, one removed due to union", ()=> {
            var ret = DiffRangeSet.add(rng('0 3 4 8'), rng('2 5'));
            expect(ret.resized).to.be.deep.equal([
                {range: {start: 0, end: 3}, start: 0, end: 8, isEndChanged: true}
            ]);
            expect(ret.removed).to.be.deep.equal([
                {start: 4, end: 8}
            ]);
        });
        it('add one that equals existing', ()=> {
            var left = [{start: 1, end: 2},
                {start: 3, end: 4}];
            var right = [
                {start: 3, end: 4}];

            var ret = DiffRangeSet.add(left, right);
            // expect(ret).to.have.property('added').that.is.empty;
            // expect(ret).to.have.property('resized').that.is.empty;
            expect(ret).to.have.property('removed').that.is.empty;
        });
        it('adding into empty set', ()=> {
            var ret = DiffRangeSet.add([], rng('0 1'));
            expect(ret).to.have.property('added').that.deep.equals([
                {start: 0, end: 1}
            ]);
            expect(ret).to.have.property('resized').that.is.empty;
            expect(ret).to.have.property('removed').that.is.empty;
        });
        it('adding into empty set with touch-join', ()=> {
            var ret = DiffRangeSet.add([], rng('0 1 1 2'));
            expect(ret).to.have.property('added').that.deep.equals([
                {start: 0, end: 2}
            ]);
            expect(ret).to.have.property('resized').that.is.empty;
            expect(ret).to.have.property('removed').that.is.empty;
        });
        it('adding nothing', ()=> {
            var ret = DiffRangeSet.add(rng('0 1 2 3'), []);
            expect(ret).to.have.property('added').that.is.empty;
            expect(ret).to.have.property('resized').that.is.empty;
            expect(ret).to.have.property('removed').that.is.empty;
        });
        it('adding nothing to nothing', ()=> {
            expect(DiffRangeSet.add([], [])).to.deep.equal({added: [], resized: [], removed: [], result: []});
        });
        it('adding nothing to touching ragnes', ()=> {
            var ret = DiffRangeSet.add(rng('0 1 1 2'), []);
            expect(ret).to.have.property('added').that.is.empty;
            expect(ret).to.have.property('resized').that.deep.equals([
                {range: {start: 0, end: 1}, start: 0, end: 2, isEndChanged: true}
            ]);
            expect(ret).to.have.property('removed').that.deep.equals([
                {start: 1, end: 2}
            ]);
        });
        describe('custom tests', ()=> {
            it('custom 1', ()=> {
                var left = rng('2 4   5 6   7 8   9 10   11 13   14 19   20 21');
                var right = rng('1 3   4 12   15 16   17 18   22 23   23 24');
                var ret = DiffRangeSet.add(left, right);
                expect(ret).to.have.property('added').that.deep.equals([
                    {start: 22, end: 24}
                ]);
                expect(ret).to.have.property('resized').that.deep.equals([
                    {range: {start: 2, end: 4}, start: 1, end: 13, isStartChanged: true, isEndChanged: true}
                ]);
                expect(ret).to.have.property('removed').that.deep.equals([
                    {start: 5, end: 6},
                    {start: 7, end: 8},
                    {start: 9, end: 10},
                    {start: 11, end: 13}
                ]);
            });

            it('custom 2', ()=> {
                var ret = DiffRangeSet.add(rng('14 19'), rng('15 16 17 18'));
                expect(ret).to.have.property('added').that.is.empty;
                expect(ret).to.have.property('resized').that.is.empty;
                expect(ret).to.have.property('removed').that.is.empty;
            });
        });

        describe('random tests', ()=> {

            function randomRangeSet(size) {
                var cnt = 0;
                var output = [];
                for (var i = 0; i < size; i++) {
                    var randomSpace = rand.intBetween(0, 3);
                    var randomSize = rand.intBetween(1, 10);
                    output.push({start: cnt + randomSpace, end: cnt + randomSpace + randomSize});
                    cnt += randomSpace + randomSize;
                }
                return output;
            }

            var rand = gen.create("DiffRangeSetTest");

            function find(range, array) {
                return array.find((a)=>a.start == range.start && a.end == range.end)
            }
            for (var i = 0; i < 100; i++) {
                it('#' + i, ()=> {
                    var numLeft = rand.intBetween(0, 10);
                    var numRight = rand.intBetween(0, 10);
                    var left = randomRangeSet(numLeft);
                    var right = randomRangeSet(numRight);
                    console.log('left', left);
                    console.log('right', right);
                    var ret = DiffRangeSet.add(left, right);
                    var cmp = qintervals.union(left, right).toObjects();
                    var result = ret.result.map((a)=> {
                        return {from: a.start, to: a.end}
                    });
                    expect(cmp).to.deep.equal(result);

                    // to test, try to transform "left" by ret.removed and ret.resized and ret.added to check if it gives same result as qintervals

                    var restore = left.filter((a)=>find(a, ret.removed) == null);
                    for (var o of ret.resized) {
                        var itemInLeft = find(o.range, left);
                        if (o.isStartChanged) {
                            itemInLeft.start = o.start;
                        }
                        if (o.isEndChanged) {
                            itemInLeft.end = o.end;
                        }
                    }

                    for (var o of ret.added) {
                        restore.push(o);
                    }
                    restore.sort((a, b)=>a.start - b.start);

                    expect(cmp.map((a)=> {
                        return {start: a.from, end: a.to}
                    })).to.deep.equal(restore);


                });
            }



        });

    });
});