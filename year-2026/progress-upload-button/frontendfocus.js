document.addEventListener("DOMContentLoaded",function(){
	let upload = document.getElementById("upload");

	if (upload) {
		let progress = 0,
			strokeLen = 310,
			startUpload = function(progressRect,elText) {
				progress = 0;

				let btnText = this.querySelector(elText);
				if (btnText)
					btnText.innerHTML = "0%";

				this.disabled = true;
				this.classList.remove("upload-btn-ready");
				this.classList.add("upload-btn-running");

				setTimeout(incProgress.bind(this,progressRect,elText),500);
			},
			incProgress = function(progressRect,elText){
				let btnProgress = this.querySelector(progressRect),
					btnText = this.querySelector(elText);

				if (progress < 1) {
					if (btnProgress) {
						let strokeVal = progress * strokeLen,
							dashVal = strokeLen - strokeVal;
						btnProgress.setAttribute("stroke-dasharray",`${strokeVal} ${dashVal}`);
						btnProgress.setAttribute("opacity","1");
					}
					if (btnText) {
						let displayVal = Math.round(progress * 100);
						btnText.innerHTML = `${displayVal}%`;
					}
					progress += 0.005;

					let interval = 17;
					setTimeout(incProgress.bind(this,progressRect,elText),interval);

				} else {
					this.classList.remove("upload-btn-running");
					this.classList.add("upload-btn-done");

					if (btnProgress)
						btnProgress.setAttribute("stroke-dasharray",`${strokeLen} 0`);
					if (btnText)
						btnText.innerHTML = "&#10003;";

					let timeout = 1500;
					setTimeout(resetUpload.bind(this,progressRect,elText),timeout);
				}
			},
			resetUpload = function(progressRect,elText) {
				this.classList.remove("upload-btn-done");
				this.classList.add("upload-btn-ready");
				this.disabled = false;

				let btnProgress = this.querySelector(progressRect),
					btnText = this.querySelector(elText);

				if (btnProgress) {
					btnProgress.setAttribute("stroke-dasharray",`0 ${strokeLen}`);
					btnProgress.setAttribute("opacity","0");
				}
				if (btnText)
					btnText.innerHTML = "Upload";
			};

		upload.addEventListener("click",startUpload.bind(
			upload,
			".upload-btn-border rect",
			".upload-btn-text"
		));
	}
});