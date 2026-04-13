async function loadBackground(mode = 'mod_siang') {
  const response = await fetch('./assets/backgrounds/background.json');
  const BG = await response.json();

  document.body.style.backgroundImage = `url('${BG[mode].imageUrl}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundAttachment = "fixed";
}
