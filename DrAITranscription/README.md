# create env, activate, install minimal deps
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip setuptools wheel
pip install -r requirements.txt

# run
py -3.11 app.py

Note: the checked-in `venv_transcription` folder was created on another machine and is not portable. Recreate the environment locally rather than relying on it.