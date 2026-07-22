import logging
from typing import List
import openai
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.dimension = 1536
        self._client = None
        self._model = None

    @property
    def client(self) -> openai.OpenAI:
        if self._client is None:
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY is not configured in settings or environment.")
            
            is_openrouter = self.api_key.startswith("sk-or-")
            base_url = "https://openrouter.ai/api/v1" if is_openrouter else None
            self._model = "openai/text-embedding-3-small" if is_openrouter else "text-embedding-3-small"
            
            self._client = openai.OpenAI(
                api_key=self.api_key,
                base_url=base_url
            )
            logger.info(f"Initialized OpenAI Embedding Client (OpenRouter: {is_openrouter}, Model: {self._model})")
        return self._client

    @property
    def model(self) -> str:
        if self._model is None:
            # Trigger client init to set model
            _ = self.client
        return self._model or "text-embedding-3-small"

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates a 1536-dimensional embedding vector for a single text using text-embedding-3-small.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty.")
        
        cleaned_text = text.replace("\n", " ").strip()
        response = self.client.embeddings.create(
            input=[cleaned_text],
            model=self.model
        )
        return response.data[0].embedding

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates 1536-dimensional embedding vectors for multiple texts.
        """
        if not texts:
            return []

        cleaned_texts = [t.replace("\n", " ").strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            raise ValueError("All input texts are empty.")

        response = self.client.embeddings.create(
            input=cleaned_texts,
            model=self.model
        )
        return [item.embedding for item in response.data]


embedding_service = EmbeddingService()
