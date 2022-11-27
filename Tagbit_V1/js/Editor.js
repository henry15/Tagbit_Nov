(function() {

function setupImage(cont, insImg) {
	function ReadFiles(fa, fp) {
		if (!fa || !fa.length || !fp) return $.Deferred().reject('No files selected').promise();
		return $.when.apply($, Array.from(fa).map(function(f) { 
			var rdr = new FileReader(), p = $.Deferred();
			rdr.onerror = function(e) { alert("File read error " + e); p.reject(e); };
			rdr.onload = function()	  { fp(rdr.result, f); p.resolve(rdr.result); }
			rdr.readAsDataURL(f);
			return p.promise();
		})).promise();
	};
	function loadFiles(fa, ev) {
		return ReadFiles(Array.from(fa).filter(function(x) { return x.type.indexOf("image") == 0; }), 
								function(r) { insImg(r, ev); })
	}
	return cont.on('dragenter dragover', false).on('drop', function (e) {
		var xfer = e.originalEvent.dataTransfer;
		if (!xfer) return;
		e.preventDefault();
		loadFiles(xfer.files, e);
	}).on('paste', function(e) {
		var cd = e.originalEvent.clipboardData;
		if (!cd || !cd.items || !cd.items.length) return;
		loadFiles(Array.from(cd.items).filter(function(x) { return x.type.startsWith("image"); })
									.map(function(x) { return x.getAsFile() }), e);
	}).on('addFile', function(e, f) {
		return loadFiles(f.files, e);
	});
}

function Scribble(cont) {
	cont = $(cont).attr('tabindex', 0).data('scribble', this);
	var self = this;
	var NS = 'http://www.w3.org/2000/svg';
	var $svg = $('<svg xmlns="' + NS + '" style="position:absolute;user-select:none;-webkit-user-select:none;-ms-user-select:none"/>')
		.prependTo(cont).attr({ width:cont.width(), height:cont.height() });
	var trkCont = $('<div class="invPrint"/>').appendTo(cont)
		.css({ position : 'absolute', pointerEvents:'none', cursor:'all-scroll' });
	var ptPrev = null, selElem = null, ptAnch = null, fNew = null;
	var tools = {}, strokes = [], shift = false;
	var hdn = $('textarea', cont);
	if (!hdn.length) hdn = $("<textarea />").hide().appendTo(cont);
	var cPen = 'P', cLine = 'L', cRect = 'R', cArrow = 'A', cText = 'T', cImg = 'I'
	var toolDef = {	
		L : { trk:2, tag:'line',  name:'&#8725; Line'		},	
		R : { trk:4, tag:'rect',  name:'&#9645; Rectangle'	},	
		A : { trk:2, tag:'path',  name:'&#8598; Arrow'		},	
		P : { trk:4, tag:'path',  name:'&#128393; Pencil'	},	
		T : { trk:4, tag:'text',  name:'&#128196; Text'		},
		I : { trk:4, tag:'image', name:'&#128443; Image'	},
		'': { name:'&#10535; Move' } 
	};
	function elemPos(el, rel) {
		var br = $(el)[0].getBoundingClientRect()
		if (!rel) { 
			var off = $svg.offset();
			br.x -= off.left; br.y -= off.top;
		}
		return { x:br.x, w:br.width, y:br.y, h:br.height };
	}
	function MousePos(e) {
		var off = $svg.offset(), t = e.originalEvent.touches,
			c = t ? Array.from(t).at(-1) : e;
		return { x: c.pageX - off.left, y:c.pageY - off.top };
	}
	function shpDims(arr) {
		var tl = { x:99999, y:99999}, br = { x:-99999, y:-99999 }
		arr.forEach(function(x) {
			tl.x = Math.min(tl.x, x.x); tl.y = Math.min(tl.y, x.y);
			br.x = Math.max(br.x, x.x); br.y = Math.max(br.y, x.y);
		});
		if (!arr.length) tl = br = { x:0, y:0 }
		var sz = { x:br.x-tl.x, y:br.y-tl.y };
		return { tl:tl, br:br, tr:{x:br.x,y:tl.y}, bl:{x:tl.x, y:br.y},
				sz:sz, mid:{x:tl.x+sz.x/2, y:tl.y+sz.y/2}};
	}
	function shpRotate(arr, c, a) {
		return arr.map(function(p) {
			var x = p.x - c.x, y = p.y - c.y, r = a * Math.PI/180;
			return { x:c.x + x*Math.cos(r)-y*Math.sin(r), 
					 y:c.y + y*Math.cos(r)+x*Math.sin(r)};
		});
	}
	function mvrEnd(e) {
		var s = $(selElem).data('stroke'), nuPen = fNew && s && s.type == cPen;
		ptAnch = ptPrev = fNew = null;
		if (!s || !s.pts) return;
		if (nuPen)			// chk if pts are too close or on the straight line.
			for (var i = s.pts.length - 2; i > 0; i--) {
				var p0 = s.pts[i-1], p1 = s.pts[i], p2 = s.pts[i+1], 
					d1 = { x:p0.x-p1.x, y:p0.y-p1.y }, d2 = { x:p2.x-p1.x, y:p2.y-p1.y };
				var res = Math.abs(Math.atan2(d1.x, d1.y)-Math.atan2(d2.x, d2.y))*180/Math.PI;
				if (Math.abs(res - 180) < 5 || (d2.x*d2.x+d2.y*d2.y) < 5)
					s.pts.splice(i, 1);
			}
		var sh = shpDims(s.pts);						// chk if shape is too small
		if (s.pts.length < 2 || sh.sz.x+sh.sz.y < 10)	// or no pts
			return CutSel();
		updElem(selElem);
		if (nuPen) {
			trkCont.empty();
			setTrkPos();
		}
	}
	var tmNxtMove = 0;				// if next move after this time drop anchor on pencil.
	function mvrMove(e) {
		if (!ptPrev || !selElem) return;
		var np = e ? MousePos(e) : ptPrev, off = { x : np.x-ptPrev.x, y : np.y-ptPrev.y };
		var s = $(selElem).data('stroke'), a = s.pts[0], b = s.pts[1] || a;
		if (!ptAnch) 
			s.pts.forEach(function(p) { p.x += off.x; p.y += off.y; });
		else if (s.type != cPen) 
			s.pts = (a == ptAnch) ? [ptAnch, np] : [np, ptAnch];
		else if (fNew) {						// when !e -> shift up ->< just add new pt.
			if (!e || tmNxtMove<new Date().getTime()) s.pts.push(np); // may end up pushing it twice
			else if (!shift && s.pts.length > 1) s.pts.pop();
			s.pts.push(np);						// mouse up will clean it up
			tmNxtMove = new Date().getTime() + 500;
		}
		else {
			var s0 = shpDims(s.pts), s1 = shpDims([np, ptAnch]), z = {x:s1.sz.x/s0.sz.x, y:s1.sz.y/s0.sz.y };
			if (Math.min(s0.sz.x, s0.sz.y, s1.sz.x, s1.sz.y) < 1) return;
			s.pts.forEach(function(x) {
				x.x = (x.x - s0.mid.x)*z.x + s1.mid.x;
				x.y = (x.y - s0.mid.y)*z.y + s1.mid.y;
			});
		}
		ptPrev = np;
		updElem(selElem);
		return;
	}
	function mvrDown(e) {
		ptPrev = MousePos(e);
		if (selElem == e.target) return;
		trkCont.empty().hide();
		selElem = e.target;
		var mkObj = tools.obj.val(), s = $(selElem).data('stroke');
		if (mkObj) {
			s = { type:mkObj, pts : [ ptPrev ], clr: tools.clr.val(), thk:tools.thk.val() };
			if (mkObj == cText) s.text = tools.text.val();
			strokes.push(s);
			fNew = ptAnch = ptPrev;
			selElem = updElem(null, s)
		}
		else if (e.target == $svg[0] || !s) 
			return selElem = null;
		tools.clr.val(s.clr);
		tools.thk.val(s.thk);
		if (s.type == cText) tools.text.show().val(s.text);
		else tools.text.hide();
		setTrkPos();
	}
	function setTrkPos() {
		var s = $(selElem).data('stroke') || {}, a = s.pts[0], b = s.pts[Math.max(s.pts.length-1, 0)];
		var sh = shpDims(fNew ? [a,b] : s.pts), hs = 8;
		var noTrk = toolDef[s.type].trk;
		if (fNew && s.type == cPen) noTrk = 2;
		pts = (noTrk == 2) ? [ { p:a, a:b }, { p:b, a:a }]
					: [ { p:sh.tl, a:sh.br }, { p:sh.tr, a:sh.bl }, { p:sh.br, a:sh.tl }, { p:sh.bl, a:sh.tr }];
		if (!trkCont[0].childElementCount)
			pts.forEach(function (x, i) {
				$('<div class=_t_/>').appendTo(trkCont) //.data('anch', x.a)
					.css({ cursor:'all-scroll', position : 'absolute', pointerEvents:'auto',
						margin:(-hs/2)+'px', width:hs+'px', height:hs+'px', background:'blue'});
			});
		$('._t_', trkCont.show()).each(function(i, t) {
			$(t).css({ left:pts[i].p.x, top:pts[i].p.y }).data('anch', noTrk == 999 ? null : pts[i].a);
		});
	}
	function trkSel(e) {
		if (!selElem) return;
		ptPrev = MousePos(e);
		var h = $(e.target), pc = elemPos(h), s = $(selElem).data('stroke');
		ptAnch = h.data('anch');
	}
	function CutSel(el) {
		el = el || selElem;
		if (!el) return null;
		var se = $(el), s = se.data('stroke'), i = strokes.indexOf(s);
		if (i >= 0) strokes.splice(i, 1);
		se.remove();
		ptAnch = ptPrev = selElem = null; 
		trkCont.empty().hide();
		return null;
	}
	function CutAll() {
		if (!confirm('Do you want to erase the drawing and start over?')) 
			return false;
		$svg.children().each(function() {
			if ($(this).data('stroke'))
				CutSel(this);
		});
		return true;
	}
	function Rotate() {
		if (!selElem) return
		var s = $(selElem).data('stroke'), sd = shpDims(s.pts);
		if (s.type == cText || s.type == cImg) s.r = ((s.r||0) + 90) % 360;
		s.pts = shpRotate(s.pts, sd.mid, 90);
		updElem(selElem);
	}
	function UpdSel() {
		if (!selElem) return
		var s = $(selElem).data('stroke');
		s.clr = tools.clr.val(); s.thk = tools.thk.val();
		if (s.type == cText) s.text = tools.text.val();
		updElem(selElem);
	}
	function AddImg(src, evt) {
		var img = $('<img/>').attr('src', src).load(function(e) {
			mvrEnd();
			var d = elemPos($svg),
				s = {x:Math.min(d.w/2,e.target.width)/2, y:Math.min(d.h/2,e.target.height)/2}, 
				c = evt.type == 'drop' ? MousePos(evt) : { x:d.x+d.w/2, y:d.y+d.h/2 }
			var o = { type:cImg, text:src, clr: tools.clr.val(), thk:tools.thk.val(),
				pts : [ { x:c.x-s.x, y:c.y-s.y}, { x:c.x+s.x, y:c.y+s.y} ] };
			strokes.push(o);
			tools.obj.val('');
			selElem = updElem(null, o)
			cont.trigger('change', cont[0].val());
			img.remove();
		});
	}
	function TypeChg() {
		mvrEnd(); trkCont.empty().hide();
		if (tools.obj.val() == cText)
			tools.text.show().val('Text...');
		else 
			tools.text.hide();
		if (tools.obj.val() == cImg) {
			var ff = $('<input type=file accept="image/*" />')
				.change(function(e) { cont.trigger('addFile', {files:e.target.files}); ff.remove(); }).click();
			tools.obj.val('')
		}
	}
	function updElem(el, s) {
		if (el) s = $(el).data('stroke');
		if (!s || !toolDef[s.type].tag) return null;
		function setAttr(el, attr) {
			for (var i in attr) el.setAttribute(i, attr[i]);
		}
		if (!el) {
			$svg.append(el = document.createElementNS( NS, toolDef[s.type].tag));
			$(el).attr({fill:'transparent'}).data('stroke', s)
		}
		var se = $(el), a = s.pts[0], b = s.pts[1]||a, sh = shpDims(s.pts);
		setAttr(el, { stroke:s.clr, 'stroke-width':s.thk });
		if ((s.r||0) % 180) sh = shpDims(shpRotate(s.pts, sh.mid, 90))
		if (s.type == cRect)
			setAttr(el, {x:sh.tl.x, y:sh.tl.y, width:sh.sz.x, height:sh.sz.y });
		else if (s.type == cLine)
			setAttr(el, { x1:a.x, x2:b.x, y1:a.y, y2:b.y });
		else if (s.type == cPen) 
			setAttr(el, { d:"M"+s.pts.map(function(x) { return "L"+x.x+" "+x.y }).join(' ').substr(1) });
		else if (s.type == cImg) 
			setAttr(el, {href:s.text, x:sh.tl.x, y:sh.tl.y, width:sh.sz.x, height:sh.sz.y,
				transform:'rotate('+(s.r||0)+' '+sh.mid.x+' '+sh.mid.y+')',
				preserveAspectRatio:"none" });
		else if (s.type == cText) {
			el.textContent = s.text
			setAttr(el, { x:sh.tl.x, y:sh.br.y, lengthAdjust:'spacingAndGlyphs', 
				textLength : Math.max(1, sh.sz.x-sh.sz.y*0.02),fill:s.clr, 'stroke-width':1,
				transform:'rotate('+(s.r||0)+' '+sh.mid.x+' '+sh.mid.y+')', 'font-size':sh.sz.y*1.2 });
		}
		else if (s.type == cArrow) {
			var al = Math.max(8,s.thk*2.5), rd = Math.PI/5, r = Math.atan2(b.y-a.y, b.x-a.x);
			setAttr(el, { d:"M" + a.x + " " + a.y + " L" + b.x + " " + b.y
				+ " M" + (b.x-al*Math.cos(r-rd)) + " " + (b.y-al*Math.sin(r-rd))
				+ " L" + b.x + " " + b.y
				+ " L" + (b.x-al*Math.cos(r+rd)) + " " + (b.y-al*Math.sin(r+rd)) });
		}
		//$(el).css({zIndex:Math.round(99999 - sh.sz.x - sh.sz.y) });
		if (el == selElem) setTrkPos();
		return el;
	}
	function kidsHtml(s) {
		var xml = new XMLSerializer()
		return $(s).children().toArray()
			.map(function(c) { return xml.serializeToString(c) }).join('');
	}

	var img = null, can = null;
	function toText(type, fp) {
		var x = "<svg width='" + $svg.width() + "' height='" + $svg.height()
					+"' xmlns='" + NS + "'>" + kidsHtml($svg) + "</svg>", b64;
		if (type == "svg")
			return x;
		try {						// try base64
			b64 = btoa(x);			// if OK -> no Unicode - save as is
			if (type == "mix") return x
		}						// failed -> do proper base64 
		catch (ex) {			// to avoid btoa browser exception
			b64 = btoa(unescape(encodeURIComponent(x)));
		}
		b64 = "data:image/svg+xml;base64," + b64;
		if (type == "base64" || type == "mix")
			return b64;
		var dim = { width:cont.width(), height : cont.height() }
		if (!img) img = $('<img/>').css(dim)[0];
		if (!can) can = $('<canvas/>').attr(dim)[0];
		$(img).load(function() { 
			var ctx = can.getContext('2d');
			ctx.clearRect(0, 0, dim.width, dim.height);
			ctx.drawImage(img, 0, 0, dim.width, dim.height);
			fp(can.toDataURL('image/' + type));
		});
		return img.src = b64;
	}
	function fromText(v) {
		ptAnch = ptPrev = selElem = null; strokes = [];
		trkCont.empty().hide();
		if (v.startsWith("data:image/svg+xml;base64,")) 
			try { v = decodeURIComponent(escape(atob( v.substr(26) ))) } 
			catch(ex) { return; };
		if (!v) return $svg.empty()
		function valOrNum(x) { return isNaN(x) ? x : parseFloat(x); }
		function LoadObj(self) {
			var se = $(self), a = {}, ne = null, r = 0, mid = {x:0, y:0};
			for (var x = self.attributes, i = x.length - 1; i >= 0; i--)
				a[x[i].name] = valOrNum(x[i].value);
			var xfrm = (a.transform||'').split(/[\s,\(\)]+/).map(valOrNum)
			if (xfrm.length >= 4 && xfrm[0] == 'rotate')			// IE doesn't save mid point
				{ r = xfrm[1], mid = { x:xfrm[2], y:xfrm[3] }; }	// if rotate(0)
			if (self.tagName == 'rect') 
				ne = { type:cRect, pts : [ {x:a.x, y:a.y }, {x:a.x+a.width, y:a.y+a.height } ] };
			else if (self.tagName == 'line') 
				ne = { type:cLine, pts : [ {x:a.x1, y:a.y1}, {x:a.x2, y:a.y2} ] };
			else if (self.tagName == 'image') {
				var pts = [	{ x:a.x, y:a.y }, { x:a.x+a.width, y:a.y+a.height }];
				if (r % 180) pts = shpRotate(pts, shpDims(pts).mid, 90);
				ne = { type:cImg, pts:pts, r:r, text:a.href };
			}
			else if (self.tagName == 'text') {
				var bl = { x:a.x, y:a.y }, h = a['font-size']/1.2, w = a.textLength+h*0.02;
				//var pts = [ { x:bl.x, y:mid.y-(bl.y-mid.y) }, { x:mid.x+mid.x-bl.x, y:mid.y+bl.y-mid.y }];
				var pts = [	{ x:bl.x, y:bl.y-h }, { x:bl.x+w, y:bl.y }];
				if (r % 180) pts = shpRotate(pts, shpDims(pts).mid, 90);
				ne = { type:cText, pts:pts, r:r, text:self.textContent };
			}
			else if (self.tagName == 'path') {
				var toks = a.d.split(/[LM\s]+/).map(function(x) { return parseFloat(x); })
											   .filter(function(x) { return !isNaN(x); }); 
				if (!toks.length || toks.length % 2) return ne;
				for (var pts = [], i = 0; i < toks.length; i += 2) 
					pts.push({ x:toks[i], y:toks[i+1] });
				ne = (pts.length == 5 && pts[1].x == pts[3].x && pts[1].y == pts[3].y)
					? { type:cArrow, pts : pts.slice(0, 2) } : { type:cPen, pts : pts };
			}
			if (!ne) return ne;
			ne.clr = a.stroke; ne.thk = a['stroke-width']; 
			se.data('stroke', ne);
			strokes.push(ne);
			return ne;
		}
		if (true || ('ActiveXObject' in window)) {	// ie11 only!!!!
			$svg.empty();
			$(v).children().each(function() { updElem(null, LoadObj(this)); });
		}
		else
			$svg.html(kidsHtml(v)).children().each(function() { LoadObj(this); });
	}
	cont[0].val = function(v) {
		if (v == undefined) {
			hdn.val(toText('mix'));
			return toText('svg'); 
		}
		fromText(v)
	}
	setupImage(cont, AddImg);
	cont.on('touchmove mousemove', mvrMove)
		.keydown(function(e) { shift = e.shiftKey; })
		.keyup(function(e) { 
			shift = e.shiftKey; 
			if (e.key == 'Delete' && e.target != tools.text[0]) {
				if (!shift)			CutSel(); 
				else if (!CutAll())	return;
				cont.trigger('change', cont[0].val());
			}
			if (e.key == "Shift" && fNew && tools.obj.val() == cPen) 
				mvrMove(null)			// if creating a pen while shift -> add pt.
		})
		.on('touchend mouseup', 'svg, ._t_', function(e) { mvrEnd(e); cont.trigger('change', cont[0].val()); })
	$svg.on('touchstart mousedown', mvrDown);
	trkCont.on('touchstart mousedown', '._t_', trkSel);
	
	function setupTools() {
		function ft(e, f) {
			f(); e.preventDefault();
			cont.trigger('change', cont[0].val())
		}
		var tb = $("<div class='invPrint' style='position:absolute; cursor:default; font-size:large; "
				+ "z-index:1; background-color:#efefef; '/>").prependTo($svg.parent());
		[	{ tip:"Tool", 		func: TypeChg,  cls:'obj', 
				text: Object.keys(toolDef).map(
					function(x) { return { val:x, name:toolDef[x].name }; } 
				) }, 
			{ tip:"Color", 		func: UpdSel, cls:'clr', text: [ 'Black', 'Red', 'Green', 'Blue', 'White' ] }, 
			{ tip:"Thickness", 	func: UpdSel, cls:'thk', text: [ 2,4,8,16 ] }, 
			{ tip:"Rotate", 	func: Rotate, cls:'rot', text: "&#8635;" }, 
			{ tip:"Delete",		func: CutSel, cls:'cut', text: "&#9986;" }, 
			{ tip:"Clear", 		func: CutAll, cls:'rst', text: "&#10060;" }
		].forEach(function(t) {
			if ($.isArray(t.text)) 
				tools[t.cls||'x'] = $('<select/>').append($(t.text.map(function(x) { 
						return typeof(x) != "object" ? '<option>' + x + '</option>'
							: '<option value=' + x.val + '>' + x.name + '</option>'; }).join('')))
					.appendTo(tb).attr({title:t.tip}).change(function(e) { ft(e, t.func); });
			else 
				tools[t.cls||'x'] = $('<div style="display:inline-block; padding: 0 4px; border:outset 1px; line-height:1em;vertical-align:top;">' 
						+ t.text + '</div>').appendTo(tb).attr({title:t.tip})
					.click(function(e) { ft(e, t.func); })
		});
		var emoji = ['&#128663;', '&#128665;', '&#128652;', '&#128666;', '&#128642;', 
					 '&#127795;', '&#127968;', '&#128678;', '&#128692;', '&#128694;', 
					 '&#128107;', '&#128696;', '&#128721;', '&#9940;', '&#9943;'], emo;
		tools.text = $('<input/>').appendTo(tb).attr({title:"Text", value:'Text' }).hide()
			.css({width:100, height:'1em'}).on('input', function(e) { ft(e, UpdSel); })
			.blur(function(e) { emo.hide(); })
			.focus(function() { 
				var p = tools.text.position();
				emo.css({ left:p.left, top:p.top + tb.height() }).show(); 
			})
		emo = $('<div style="font-size:x-large; position:absolute; width:200px; border:outset 1px; background-color:#efefef;">' 
					+ emoji.map(function(x) { return '<span style="padding:4px;display:inline-block;width:30px;height:32px;text-align:center;">' + x + '</span>' }).join('') 
				+ '</div>').appendTo(tb).hide()
			.on('touchstart mousedown', 'span', function(e) {
				var p = tools.text.focus().prop('selectionStart'), v = tools.text.val(), n = $(this).html();
				tools.text.val(v.substr(0, p) + n + v.substr(p)).trigger('input');
				tools.text[0].setSelectionRange(p + n.length, p + n.length);
				e.preventDefault();
			})
			.on('mouseenter mouseleave', 'span', function(e) {
				$(this).css({ backgroundColor: e.type == 'mouseleave' ? '#efefef' : '#e0e0e0' });
			});
			
	}
	setupTools();
	fromText(hdn.val()); 
	this.toText = toText;
	this.fromText = fromText;
	return this;
}
$.fn.Scribble = function(method) {
	var el = $(this), s = el.data('scribble'), args = arguments;
	if (typeof(method) == 'string' && s && $.isFunction(s[method])) 
		return s[method].apply(this, Array.prototype.slice.call(args, 1));
	return this.each(function() { new Scribble(this, method); });
};

})();

