#include <stdint.h>
#include <stdlib.h>
#include <emscripten.h>

#define _min(a, b) ((a) < (b) ? (a) : (b))
#define _max(a, b) ((a) > (b) ? (a) : (b))
#define _clamp(x, a, b) _min(_max(x, a), b)
#define _scale_l(x, s) ((x) * (s))
#define _scale_h(x, s) (255 - (255 - (x)) * (s))
#define _free(x)  \
    if (x)        \
    {             \
        free(x);  \
        x = NULL; \
    }
static inline void *Malloc(size_t size)
{
    void *ptr = malloc(size);
    if (!ptr)
    {
        EM_ASM({ throw new Error('malloc failed'); });
    }
    return ptr;
}
static inline int _mix(uint8_t i, uint8_t c, uint8_t ai, float a, float w)
{
    return ((i - ai + 255 - c) * w + ai - 255 + c) / a;
}

EMSCRIPTEN_KEEPALIVE
int process(int type, int length,
            int mode, float scale_i, float scale_c, int algo, float weight,
            uint8_t *inner, uint8_t *cover, uint8_t *output)
{
    static uint8_t *innerCache = NULL;
    static uint8_t *coverCache = NULL;
    static float *alphaCache = NULL;
    switch (type)
    {
    case 0:
    case 1:
        _free(innerCache);
        innerCache = (uint8_t *)Malloc(length);
        for (uint8_t *p = inner, *end = inner + length, *c = innerCache; p < end; p++, c++)
        {
            *c++ = _scale_l(*p++, scale_i);
            *c++ = _scale_l(*p++, scale_i);
            *c++ = _scale_l(*p++, scale_i);
        }
    case 2:
        if (type != 1) // skip if type == 1
        {
            _free(coverCache);
            coverCache = (uint8_t *)Malloc(length);
            for (uint8_t *p = cover, *end = cover + length, *c = coverCache; p < end; p++, c++)
            {
                *c++ = _scale_h(*p++, scale_c);
                *c++ = _scale_h(*p++, scale_c);
                *c++ = _scale_h(*p++, scale_c);
            }
        }
    case 3:
        if (mode)
        {
            switch (algo)
            {
            case 0: // LAB
                _free(alphaCache);
                alphaCache = (float *)Malloc((length >> 2) * sizeof(float));
                float *pa = alphaCache;
                for (uint8_t *pi = innerCache, *pc = coverCache, *ei = innerCache + length; pi < ei; pi++, pc++)
                {
                    uint8_t ir = *pi++, ig = *pi++, ib = *pi++;
                    uint8_t cr = *pc++, cg = *pc++, cb = *pc++;
                    int dr = ir - cr, dg = ig - cg, db = ib - cb;
                    float a = 1 + (((2048 | (dr + ((ir + cr) << 1))) * dr - (db + ((ir + cr) << 1) - 3068) * db + (dg << 12)) / (float)(1020 * (dr - db) + 2349060));
                    *pa++ = _clamp(a, 0.005, 1);
                }
                break;
            default:
                return -1;
            }
        }
    case 4:
        if (mode) // Colored
        {
            float *pa = alphaCache;
            for (uint8_t *pi = innerCache, *pc = coverCache, *po = output, *ei = innerCache + length; pi < ei; pi++, pc++, pa++)
            {
                uint8_t a = 255 * *pa;
                int r = _mix(*pi++, *pc++, a, *pa, weight), g = _mix(*pi++, *pc++, a, *pa, weight), b = _mix(*pi++, *pc++, a, *pa, weight);
                *po++ = _clamp(r, 0, 255);
                *po++ = _clamp(g, 0, 255);
                *po++ = _clamp(b, 0, 255);
                *po++ = a;
            }
        }
        else // Grayscale
        {
            for (uint8_t *pi = innerCache, *pc = coverCache, *po = output, *ei = innerCache + length; pi < ei; pi += 4, pc += 4)
            {
                int a = 255 - *pc + *pi;
                a = _min(a, 255);
                int l = *pi * 255 / a;
                l = _min(l, 255);
                *po++ = l;
                *po++ = l;
                *po++ = l;
                *po++ = a;
            }
        }
        break;
    }
    return 0;
}