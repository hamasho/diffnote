var Diff = {

  /**
   * Return array of diff objects.
   *
   * var diff = Diff.diff(base, newtxt);
   * diff => [
   *   { change: 'insert',
   *     newtxt: ['this', 'is', 'a', 'test'],
   *     baseLine: 2 },
   *   { change: 'delete',
   *     base: 'Some line',
   *     baseLine: 3 },
   * ]
   */
  diff: function(base, newtxt) {
    base = difflib.stringAsLines(base);
    newtxt = difflib.stringAsLines(newtxt);
    var sm = new difflib.SequenceMatcher(base, newtxt);
    var opcodes = sm.get_opcodes();
    var result = [];
    var i, j, k;
    for (i = 0; i < opcodes.length; i++) {
      var code = opcodes[i];
      var change = code[0];
      var bs = code[1];
      var be = code[2];
      var ns = code[3];
      var ne = code[4];
      var lines;
      if (change === 'insert') {
        result.push({
          change: change,
          newtxt: newtxt.slice(ns, ne),
          baseLine: bs,
        });
      } else if (change == 'delete') {
        for (j = bs; j < be; j++) {
          result.push({
            change: change,
            base: base[j],
            baseLine: j,
          });
        }
      } else if (change == 'replace') {
        j = bs;
        k = ns;
        while (j < be && k < ne) {
          result.push({
            change: change,
            base: base[j],
            newtxt: newtxt[k],
            baseLine: j,
          });
          j++; k++;
        }
        while (j < be) {
          result.push({
            change: 'delete',
            base: base[j],
            baseLine: j,
          });
          j++;
        }
        if (k < ne) {
          result.push({
            change: 'insert',
            newtxt: newtxt.slice(k, ne),
            baseLine: j,
          });
          k++;
        }
      }
    }
    return result;
  },

};

var memoPanelContainer = {

  _panels: [],
  snapshot: null,

  updateNote: function(note) {
    var panelsOld = this._panels;
    this._panels = [];
    var diff = Diff.diff(this.snapshot, note);
    for (var i = 0; i < diff.length; i++) {
      var idx = diff[i].baseLine;
      var memo = panelsOld[idx] ? panelsOld[idx].memo : '';
      this._panels[idx] = diff[i];
      this._panels[idx].memo = memo;
    }
  },

  showMemoPanels: function() {
    var that = this;
    var updateMemo = function() {
      var baseLine = parseInt($(this).attr('id').replace('memo-', ''));
      that._panels[baseLine].memo = $(this).val();
    };
    var wrapper = $('#diff-panel-wrapper');
    wrapper.text('');
    for (var i = 0; i < this._panels.length; i++) {
      var panel = this._panels[i];
      if ( ! panel) continue;
      var panelDiv = $('<div></div>').addClass('diff-panel');
      if (panel.change == 'replace' || panel.change == 'delete') {
        var deleteHeader = $('<div></div>')
          .addClass('diff-removed-line bg-danger')
          .html(this._convertHtml(panel.base, panel.newtxt, 'delete'));
        panelDiv.append(deleteHeader);
      }
      if (panel.change == 'replace') {
        var replaceHeader = $('<div></div>')
          .addClass('diff-added-line bg-success')
          .html(this._convertHtml(panel.base, panel.newtxt, 'replace'));
        panelDiv.append(replaceHeader);
      } else if (panel.change == 'insert') {
        var insertHeader = $('<div></div>')
          .addClass('diff-added-line bg-success')
          .html(panel.newtxt.join('<br>'));
        panelDiv.append(insertHeader);

      }
      var textarea = $('<textarea></textarea>')
        .addClass('diff-memo')
        .val(panel.memo)
        .attr('rows', '1')
        .attr('id', 'memo-' + panel.baseLine)
        .on('input', updateMemo);
      var memoWrapper = $('<div></div>')
        .addClass('diff-memo-wrapper')
        .append(textarea);
      panelDiv.append(memoWrapper);
      wrapper.append(panelDiv);
    }
  },

  _convertHtml: function(base, newtxt, change) {
    var diff = JsDiff.diffChars(base, newtxt);
    var result = '';
    var i;
    if (change == 'delete') {
      for (i = 0; i < diff.length; i++) {
        if (diff[i].removed) {
          result += '<span class="diff-removed-char">' + diff[i].value + '</span>';
        } else if ( ! diff[i].added) {
          result += diff[i].value;
        }
      }
    } else if (change == 'replace') {
      for (i = 0; i < diff.length; i++) {
        if (diff[i].added) {
          result += '<span class="diff-added-char">' + diff[i].value + '</span>';
        } else if ( ! diff[i].removed) {
          result += diff[i].value;
        }
      }
    }
    return result;
  },

};

(function testDiff(execute) {
  if ( ! execute) return;

  var str1 = 'a\nb\ncd\nef\ng\nh';
  var str2 = 'a\ncd\nef\ng\nh';
  //console.log(Diff.diffLines(str1, str2));
  var str3 = 'a\ncd\nef\nh';
  //console.log(Diff.diffLines(str1, str3));
  var str4 = 'a\nb\ncc\nef\ng\nh';
  console.log(Diff.diffLines(str1, str4));

})(false);
