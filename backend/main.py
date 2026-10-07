from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from wsd import predict

app = FastAPI(title="Hindi WSD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WSDRequest(BaseModel):
    sentence: str
    target_word: str


@app.get("/")
def root():
    return {"message": "Hindi WSD API is running"}


@app.post("/predict")
def predict_sense(request: WSDRequest):
    return predict(
        request.sentence,
        request.target_word
    )
