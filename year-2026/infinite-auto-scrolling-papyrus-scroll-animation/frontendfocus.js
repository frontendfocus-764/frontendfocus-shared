const scrollContent = [
  { type:'title', text:'The Chronicle of Forgotten Kings', sub:'Book the First' },
  { type:'verse', drop:'I', text:'n the age before memory, when the river still remembered the names of the stars, there ruled a king whose crown was carved of golden reed and whose voice could still a storm mid-flight.' },
  { type:'verse', text:'He walked among the pillars of the temple at dusk, and the priests said his shadow fell longer than the obelisks themselves, though none dared measure it.' },
  { type:'divider', text:'⚜' },
  { type:'verse', drop:'A', text:'nd it came to pass that the desert winds carried whispers from beyond the seventh gate, telling of a serpent coiled around the roots of the world, waiting for the ink of prophecy to dry.' },
  { type:'verse', text:'The scribes wrote by lamplight, pressing reed to papyrus, each stroke a covenant between the living and the dust of those not yet born.' },
  { type:'divider', text:'⚜' },
  { type:'verse', drop:'T', text:'hus the scroll unrolls without end, for a story once carved in gold does not conclude — it merely turns, and turns again, like the wheel beneath the sun barge.' },
  { type:'verse', text:'Let the reader take heed: what is written here has no final page, for time itself is but a longer scroll than any hand can hold.' },
  { type:'divider', text:'⚜' }
];

function buildFragment(list){
  const frag = document.createDocumentFragment();
  list.forEach(item=>{
    if(item.type === 'title'){
      const h = document.createElement('div');
      h.className = 'title';
      h.innerHTML = item.text + (item.sub ? '<small>'+item.sub+'</small>' : '');
      frag.appendChild(h);
    } else if(item.type === 'divider'){
      const d = document.createElement('div');
      d.className = 'divider';
      d.textContent = item.text + '  ' + item.text + '  ' + item.text;
      frag.appendChild(d);
    } else {
      const p = document.createElement('p');
      p.className = 'verse';
      const dropHtml = item.drop ? '<span class="dropcap">'+item.drop+'</span>' : '';
      p.innerHTML = dropHtml + item.text;
      frag.appendChild(p);
    }
  });
  return frag;
}

const track = document.getElementById('track');
track.appendChild(buildFragment(scrollContent));
track.appendChild(buildFragment(scrollContent));

